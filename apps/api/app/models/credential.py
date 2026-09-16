import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models._mixins import UUIDPrimaryKeyMixin, utcnow


class Credential(UUIDPrimaryKeyMixin, Base):
    """Issued verifiable skills-passport credential (differentiator F).

    `credential_jwt` holds the signed Open Badges 3.0 / W3C VC payload — the
    verify endpoint checks its signature rather than trusting this row.
    """

    __tablename__ = "credentials"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    session_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("lab_sessions.id"), unique=True, index=True
    )
    credential_jwt: Mapped[str] = mapped_column(Text)
    issued_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow
    )
    revoked_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
