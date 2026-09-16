from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models._mixins import UUIDPrimaryKeyMixin, utcnow


class AuditEvent(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "audit_events"

    actor: Mapped[str] = mapped_column(String(255))
    action: Mapped[str] = mapped_column(String(100))
    object: Mapped[str] = mapped_column(String(255))
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
