import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models._mixins import CreatedAtMixin, UUIDPrimaryKeyMixin


class LabSessionStatus(str, enum.Enum):
    """Mirrors the lab state machine in docs/blueprint.md §11."""

    requested = "requested"
    provisioning = "provisioning"
    ready = "ready"
    active = "active"
    expired = "expired"
    destroying = "destroying"
    destroyed = "destroyed"
    failed = "failed"


class LabSession(UUIDPrimaryKeyMixin, CreatedAtMixin, Base):
    __tablename__ = "lab_sessions"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    lab_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("labs.id"), index=True)
    variant_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("lab_variants.id"), nullable=True
    )
    status: Mapped[LabSessionStatus] = mapped_column(
        Enum(LabSessionStatus, name="lab_session_status"),
        default=LabSessionStatus.requested,
    )
    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    # Opaque pointer to the provisioned infra (e.g. Terraform state key).
    resource_ref: Mapped[str | None] = mapped_column(String(255), nullable=True)
    # Hash of the session's unique flag — never the flag itself.
    flag_hash: Mapped[str | None] = mapped_column(String(128), nullable=True)
