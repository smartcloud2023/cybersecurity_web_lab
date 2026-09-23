from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.audit import record_audit_event
from app.core.email import send_verification_email
from app.core.security import (
    create_access_token,
    create_mfa_pending_token,
    decode_mfa_pending_token,
    generate_totp_secret,
    generate_verification_code,
    hash_code,
    hash_password,
    totp_provisioning_uri,
    verify_code,
    verify_password,
    verify_totp_code,
)
from app.core.sessions import create_session
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    LoginResponse,
    MfaConfirmRequest,
    MfaDisableRequest,
    MfaSetupResponse,
    MfaVerifyRequest,
    ProfileUpdateRequest,
    RegisterRequest,
    TokenResponse,
    UserOut,
    VerifyEmailRequest,
)

router = APIRouter(tags=["auth"])

VERIFICATION_CODE_TTL = timedelta(minutes=10)


def _issue_verification_code(user: User, background_tasks: BackgroundTasks) -> None:
    code = generate_verification_code()
    user.verification_code_hash = hash_code(code)
    user.verification_code_expires_at = datetime.now(timezone.utc) + VERIFICATION_CODE_TTL
    # Sent after the response goes out — an unreachable/slow SMTP server
    # (see app/core/email.py's timeout + fallback) shouldn't make
    # register/resend hang on the request itself.
    background_tasks.add_task(send_verification_email, user.email, code)


def _issue_session_token(db: Session, user: User, request: Request) -> str:
    session = create_session(db, user.id, request)
    return create_access_token(user.id, session.id)


@router.post("/auth/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(
    body: RegisterRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> TokenResponse:
    existing = db.scalar(select(User).where(User.email == body.email))
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user = User(
        email=body.email,
        auth_id=body.email,
        hashed_password=hash_password(body.password),
    )
    _issue_verification_code(user, background_tasks)
    db.add(user)
    db.flush()

    token = _issue_session_token(db, user, request)
    record_audit_event(db, user.id, "auth.register")
    db.commit()
    db.refresh(user)
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.post("/auth/login", response_model=LoginResponse, response_model_exclude_none=True)
def login(body: LoginRequest, request: Request, db: Session = Depends(get_db)) -> LoginResponse:
    invalid = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect email or password",
    )

    user = db.scalar(select(User).where(User.email == body.email))
    if user is None or not verify_password(body.password, user.hashed_password):
        raise invalid

    if user.mfa_enabled:
        return LoginResponse(mfa_required=True, pending_token=create_mfa_pending_token(user.id))

    token = _issue_session_token(db, user, request)
    record_audit_event(db, user.id, "auth.login")
    db.commit()
    return LoginResponse(access_token=token, user=UserOut.model_validate(user))


@router.post("/auth/mfa/verify", response_model=TokenResponse)
def mfa_verify(
    body: MfaVerifyRequest, request: Request, db: Session = Depends(get_db)
) -> TokenResponse:
    session_expired = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="That login attempt expired — log in again",
    )

    user_id = decode_mfa_pending_token(body.pending_token)
    if user_id is None:
        raise session_expired

    user = db.get(User, user_id)
    if user is None or not user.mfa_enabled or not user.mfa_secret:
        raise session_expired

    if not verify_totp_code(user.mfa_secret, body.code):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect code")

    token = _issue_session_token(db, user, request)
    record_audit_event(db, user.id, "auth.login", "mfa")
    db.commit()
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def read_me(current_user: User = Depends(get_current_user)) -> UserOut:
    return UserOut.model_validate(current_user)


@router.patch("/me", response_model=UserOut)
def update_me(
    body: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserOut:
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    record_audit_event(db, current_user.id, "profile.updated")
    db.commit()
    db.refresh(current_user)
    return UserOut.model_validate(current_user)


@router.post("/auth/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    body: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Current password is incorrect"
        )
    current_user.hashed_password = hash_password(body.new_password)
    record_audit_event(db, current_user.id, "auth.password_changed")
    db.commit()


@router.post("/auth/verify-email", response_model=UserOut)
def verify_email(
    body: VerifyEmailRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserOut:
    if current_user.email_verified:
        return UserOut.model_validate(current_user)

    invalid = HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect or expired code"
    )
    if not current_user.verification_code_hash or not current_user.verification_code_expires_at:
        raise invalid
    if current_user.verification_code_expires_at < datetime.now(timezone.utc):
        raise invalid
    if not verify_code(body.code, current_user.verification_code_hash):
        raise invalid

    current_user.email_verified = True
    current_user.verification_code_hash = None
    current_user.verification_code_expires_at = None
    record_audit_event(db, current_user.id, "auth.email_verified")
    db.commit()
    db.refresh(current_user)
    return UserOut.model_validate(current_user)


@router.post("/auth/resend-verification", status_code=status.HTTP_204_NO_CONTENT)
def resend_verification(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    if current_user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already verified"
        )
    _issue_verification_code(current_user, background_tasks)
    db.commit()


@router.post("/auth/mfa/setup", response_model=MfaSetupResponse)
def mfa_setup(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MfaSetupResponse:
    if current_user.mfa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA is already enabled — disable it before setting up again",
        )
    secret = generate_totp_secret()
    current_user.mfa_secret = secret
    db.commit()
    return MfaSetupResponse(
        secret=secret, otpauth_uri=totp_provisioning_uri(secret, current_user.email)
    )


@router.post("/auth/mfa/confirm", response_model=UserOut)
def mfa_confirm(
    body: MfaConfirmRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserOut:
    if not current_user.mfa_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Start MFA setup first"
        )
    if not verify_totp_code(current_user.mfa_secret, body.code):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect code")
    current_user.mfa_enabled = True
    record_audit_event(db, current_user.id, "auth.mfa_enabled")
    db.commit()
    db.refresh(current_user)
    return UserOut.model_validate(current_user)


@router.post("/auth/mfa/disable", status_code=status.HTTP_204_NO_CONTENT)
def mfa_disable(
    body: MfaDisableRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    if not verify_password(body.password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect password"
        )
    current_user.mfa_enabled = False
    current_user.mfa_secret = None
    record_audit_event(db, current_user.id, "auth.mfa_disabled")
    db.commit()
