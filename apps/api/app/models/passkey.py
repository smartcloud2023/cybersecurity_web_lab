import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models._mixins import CreatedAtMixin, UUIDPrimaryKeyMixin


class Passkey(UUIDPrimaryKeyMixin, CreatedAtMixin, Base):
    """A registered WebAuthn credential (passkey).

    credential_id/public_key are stored base64url-encoded (the format the
    `webauthn` library already speaks) rather than raw bytes — plain Text
    columns, no binary handling needed on either side. sign_count backs
    WebAuthn's clone-detection check: a cloned authenticator's counter goes
    stale, and a stall/regression there should be rejected, not silently
    accepted.
    """

    __tablename__ = "passkeys"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    name: Mapped[str] = mapped_column(String(100))
    credential_id: Mapped[str] = mapped_column(Text, unique=True, index=True)
    public_key: Mapped[str] = mapped_column(Text)
    sign_count: Mapped[int] = mapped_column(Integer, default=0)
    last_used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
