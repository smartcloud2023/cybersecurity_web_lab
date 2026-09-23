import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models._mixins import CreatedAtMixin, UUIDPrimaryKeyMixin, utcnow


class AuthSession(UUIDPrimaryKeyMixin, CreatedAtMixin, Base):
    """One row per issued access token (Devices & Sessions).

    The token's `sid` claim points here — get_current_session checks
    revoked_at on every authenticated request, which is what makes revoking
    a session actually take effect immediately rather than just hiding it
    from a list while the token keeps working.
    """

    __tablename__ = "auth_sessions"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(64), nullable=True)
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
