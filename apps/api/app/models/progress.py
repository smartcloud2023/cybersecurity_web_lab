import enum
import uuid

from sqlalchemy import Enum, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models._mixins import UUIDPrimaryKeyMixin


class ProgressStatus(str, enum.Enum):
    not_started = "not_started"
    in_progress = "in_progress"
    completed = "completed"


class Progress(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "progress"
    __table_args__ = (UniqueConstraint("user_id", "lab_id", name="uq_progress_user_lab"),)

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    lab_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("labs.id"), index=True)
    status: Mapped[ProgressStatus] = mapped_column(
        Enum(ProgressStatus, name="progress_status"), default=ProgressStatus.not_started
    )
    score: Mapped[int] = mapped_column(Integer, default=0)
