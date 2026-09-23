import uuid

from sqlalchemy.orm import Session

from app.models.audit import AuditEvent


def record_audit_event(db: Session, actor: uuid.UUID | str, action: str, obj: str = "") -> None:
    db.add(AuditEvent(actor=str(actor), action=action, object=obj))
