import json
import uuid

import webauthn
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from webauthn.helpers import base64url_to_bytes, bytes_to_base64url
from webauthn.helpers.structs import (
    AuthenticatorSelectionCriteria,
    PublicKeyCredentialDescriptor,
    UserVerificationRequirement,
)

from app.api.deps import get_current_user
from app.core.audit import record_audit_event
from app.core.config import settings
from app.core.security import (
    WEBAUTHN_AUTHENTICATION_SCOPE,
    WEBAUTHN_REGISTRATION_SCOPE,
    create_access_token,
    create_webauthn_challenge_token,
    decode_webauthn_challenge_token,
)
from app.core.sessions import create_session
from app.db.session import get_db
from app.models._mixins import utcnow
from app.models.passkey import Passkey
from app.models.user import User
from app.schemas.account import (
    PasskeyLoginOptionsOut,
    PasskeyLoginOptionsRequest,
    PasskeyLoginVerifyRequest,
    PasskeyOut,
    PasskeyRegistrationOptionsOut,
    PasskeyRegistrationVerifyRequest,
)
from app.schemas.auth import TokenResponse, UserOut

router = APIRouter(tags=["passkeys"])

# Registration requires the authenticator to verify the user (biometric/PIN,
# not just a touch/presence check) so that a passkey is always at least as
# strong as the TOTP MFA it's allowed to substitute for at login — see
# login/verify below.
_AUTHENTICATOR_SELECTION = AuthenticatorSelectionCriteria(
    user_verification=UserVerificationRequirement.PREFERRED
)


@router.get("/me/passkeys", response_model=list[PasskeyOut])
def list_passkeys(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Passkey]:
    return list(
        db.scalars(
            select(Passkey)
            .where(Passkey.user_id == current_user.id)
            .order_by(Passkey.created_at.desc())
        )
    )


@router.delete("/me/passkeys/{passkey_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_passkey(
    passkey_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    passkey = db.get(Passkey, passkey_id)
    if passkey is None or passkey.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Passkey not found")
    db.delete(passkey)
    record_audit_event(db, current_user.id, "passkey.removed", passkey.name)
    db.commit()


@router.post("/auth/passkeys/register/options", response_model=PasskeyRegistrationOptionsOut)
def registration_options(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PasskeyRegistrationOptionsOut:
    existing = db.scalars(select(Passkey).where(Passkey.user_id == current_user.id)).all()
    options = webauthn.generate_registration_options(
        rp_id=settings.webauthn_rp_id,
        rp_name=settings.webauthn_rp_name,
        user_id=current_user.id.bytes,
        user_name=current_user.email,
        user_display_name=current_user.email,
        authenticator_selection=_AUTHENTICATOR_SELECTION,
        exclude_credentials=[
            PublicKeyCredentialDescriptor(id=base64url_to_bytes(p.credential_id))
            for p in existing
        ],
    )
    challenge_token = create_webauthn_challenge_token(
        WEBAUTHN_REGISTRATION_SCOPE, current_user.id, options.challenge
    )
    return PasskeyRegistrationOptionsOut(
        challenge_token=challenge_token,
        options=json.loads(webauthn.options_to_json(options)),
    )


@router.post("/auth/passkeys/register/verify", response_model=PasskeyOut)
def registration_verify(
    body: PasskeyRegistrationVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Passkey:
    expired = HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="That passkey setup expired — try again",
    )
    decoded = decode_webauthn_challenge_token(body.challenge_token, WEBAUTHN_REGISTRATION_SCOPE)
    if decoded is None:
        raise expired
    user_id, challenge = decoded
    if user_id != current_user.id:
        raise expired

    try:
        verified = webauthn.verify_registration_response(
            credential=body.credential,
            expected_challenge=challenge,
            expected_rp_id=settings.webauthn_rp_id,
            expected_origin=settings.webauthn_origin,
            require_user_verification=True,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=f"Couldn't verify passkey: {exc}"
        ) from exc

    passkey = Passkey(
        user_id=current_user.id,
        name=body.name,
        credential_id=bytes_to_base64url(verified.credential_id),
        public_key=bytes_to_base64url(verified.credential_public_key),
        sign_count=verified.sign_count,
    )
    db.add(passkey)
    record_audit_event(db, current_user.id, "passkey.added", body.name)
    db.commit()
    db.refresh(passkey)
    return passkey


@router.post("/auth/passkeys/login/options", response_model=PasskeyLoginOptionsOut)
def login_options(
    body: PasskeyLoginOptionsRequest, db: Session = Depends(get_db)
) -> PasskeyLoginOptionsOut:
    user = db.scalar(select(User).where(User.email == body.email))
    allow_credentials: list[PublicKeyCredentialDescriptor] = []
    if user is not None:
        passkeys = db.scalars(select(Passkey).where(Passkey.user_id == user.id)).all()
        allow_credentials = [
            PublicKeyCredentialDescriptor(id=base64url_to_bytes(p.credential_id))
            for p in passkeys
        ]

    options = webauthn.generate_authentication_options(
        rp_id=settings.webauthn_rp_id,
        allow_credentials=allow_credentials,
        user_verification=UserVerificationRequirement.PREFERRED,
    )
    # No account with this email, or one with no passkeys, still gets a
    # normal-shaped response (empty allow_credentials) rather than a 404 —
    # same non-enumeration posture as the password login endpoint. The
    # challenge token's subject is only used if a matching credential is
    # actually found at verify time, so a placeholder id here is harmless.
    challenge_token = create_webauthn_challenge_token(
        WEBAUTHN_AUTHENTICATION_SCOPE, user.id if user else uuid.uuid4(), options.challenge
    )
    return PasskeyLoginOptionsOut(
        challenge_token=challenge_token,
        options=json.loads(webauthn.options_to_json(options)),
    )


@router.post("/auth/passkeys/login/verify", response_model=TokenResponse)
def login_verify(
    body: PasskeyLoginVerifyRequest, request: Request, db: Session = Depends(get_db)
) -> TokenResponse:
    invalid = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="That passkey login didn't work"
    )
    decoded = decode_webauthn_challenge_token(body.challenge_token, WEBAUTHN_AUTHENTICATION_SCOPE)
    if decoded is None:
        raise invalid

    _, challenge = decoded
    credential_id = body.credential.get("id") or body.credential.get("rawId")
    passkey = (
        db.scalar(select(Passkey).where(Passkey.credential_id == credential_id))
        if credential_id
        else None
    )
    if passkey is None:
        raise invalid

    try:
        verified = webauthn.verify_authentication_response(
            credential=body.credential,
            expected_challenge=challenge,
            expected_rp_id=settings.webauthn_rp_id,
            expected_origin=settings.webauthn_origin,
            credential_public_key=base64url_to_bytes(passkey.public_key),
            credential_current_sign_count=passkey.sign_count,
            # A passkey login is treated as satisfying MFA on its own (it's
            # already a hardware-backed "something you have" plus, with
            # user verification required, "something you are/know") — so
            # this skips the separate TOTP step entirely rather than
            # chaining into it.
            require_user_verification=True,
        )
    except Exception:
        raise invalid from None

    user = db.get(User, passkey.user_id)
    if user is None:
        raise invalid

    passkey.sign_count = verified.new_sign_count
    passkey.last_used_at = utcnow()

    session = create_session(db, user.id, request)
    token = create_access_token(user.id, session.id)
    record_audit_event(db, user.id, "auth.login", "passkey")
    db.commit()
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))
