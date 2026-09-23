import uuid

from fastapi import Request
from sqlalchemy.orm import Session

from app.models.auth_session import AuthSession


def create_session(db: Session, user_id: uuid.UUID, request: Request) -> AuthSession:
    """Records a new session at the point a real access token is minted
    (register, password login, MFA-verified login, passkey login) — never
    for the MFA-pending/WebAuthn-challenge tokens, which aren't sessions."""
    session = AuthSession(
        user_id=user_id,
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
    )
    db.add(session)
    db.flush()  # populates session.id for the caller without committing yet
    return session
