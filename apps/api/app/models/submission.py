import enum
import uuid

from sqlalchemy import Enum, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models._mixins import CreatedAtMixin, UUIDPrimaryKeyMixin


class SubmissionResult(str, enum.Enum):
    correct = "correct"
    incorrect = "incorrect"


class Submission(UUIDPrimaryKeyMixin, CreatedAtMixin, Base):
    __tablename__ = "submissions"

    session_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("lab_sessions.id"), index=True
    )
    step_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("lab_steps.id"))
    answer: Mapped[str] = mapped_column(Text)
    result: Mapped[SubmissionResult] = mapped_column(
        Enum(SubmissionResult, name="submission_result")
    )
    attempts: Mapped[int] = mapped_column(Integer, default=1)
