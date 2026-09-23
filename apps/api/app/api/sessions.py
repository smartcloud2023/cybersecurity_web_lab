import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.api.deps import get_current_session, get_current_user
from app.core.audit import record_audit_event
from app.db.session import get_db
from app.models._mixins import utcnow
from app.models.auth_session import AuthSession
from app.models.user import User
from app.schemas.account import SessionOut

router = APIRouter(prefix="/me/sessions", tags=["sessions"])


@router.get("", response_model=list[SessionOut])
def list_sessions(
    current_session: AuthSession = Depends(get_current_session),
    db: Session = Depends(get_db),
) -> list[SessionOut]:
    sessions = db.scalars(
        select(AuthSession)
        .where(AuthSession.user_id == current_session.user_id, AuthSession.revoked_at.is_(None))
        .order_by(AuthSession.last_seen_at.desc())
    ).all()
    return [
        SessionOut(
            id=s.id,
            user_agent=s.user_agent,
            ip_address=s.ip_address,
            created_at=s.created_at,
            last_seen_at=s.last_seen_at,
            is_current=(s.id == current_session.id),
        )
        for s in sessions
    ]


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def revoke_session(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    target = db.get(AuthSession, session_id)
    if target is None or target.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    target.revoked_at = utcnow()
    record_audit_event(db, current_user.id, "session.revoked", str(session_id))
    db.commit()


@router.post("/revoke-others", status_code=status.HTTP_204_NO_CONTENT)
def revoke_other_sessions(
    current_user: User = Depends(get_current_user),
    current_session: AuthSession = Depends(get_current_session),
    db: Session = Depends(get_db),
) -> None:
    db.execute(
        update(AuthSession)
        .where(
            AuthSession.user_id == current_user.id,
            AuthSession.id != current_session.id,
            AuthSession.revoked_at.is_(None),
        )
        .values(revoked_at=utcnow())
    )
    record_audit_event(db, current_user.id, "session.revoked_others")
    db.commit()
