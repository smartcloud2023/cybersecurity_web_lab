from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.audit import AuditEvent
from app.models.user import User
from app.schemas.account import AuditEventOut

router = APIRouter(prefix="/me/audit-events", tags=["audit"])


@router.get("", response_model=list[AuditEventOut])
def list_audit_events(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[AuditEvent]:
    return list(
        db.scalars(
            select(AuditEvent)
            .where(AuditEvent.actor == str(current_user.id))
            .order_by(AuditEvent.timestamp.desc())
            .limit(50)
        )
    )
