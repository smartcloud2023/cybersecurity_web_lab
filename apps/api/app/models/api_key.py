import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models._mixins import CreatedAtMixin, UUIDPrimaryKeyMixin


class ApiKey(UUIDPrimaryKeyMixin, CreatedAtMixin, Base):
    """A personal API key. The raw key is shown to the user exactly once,
    at creation — only its hash and a short display prefix are stored.

    Nothing in the API accepts one of these as a credential yet (there's no
    public API surface for it to authenticate against) — this is the
    issuance/management side, ready for when one ships.
    """

    __tablename__ = "api_keys"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    name: Mapped[str] = mapped_column(String(100))
    prefix: Mapped[str] = mapped_column(String(16))
    key_hash: Mapped[str] = mapped_column(String(64))
    last_used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
