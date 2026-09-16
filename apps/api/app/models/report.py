import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models._mixins import UUIDPrimaryKeyMixin


class Report(UUIDPrimaryKeyMixin, Base):
    """Student findings report + Claude grading result (differentiator D)."""

    __tablename__ = "reports"

    session_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("lab_sessions.id"), unique=True, index=True
    )
    content: Mapped[str] = mapped_column(Text)
    rubric_id: Mapped[str] = mapped_column(String(64))
    grade: Mapped[int | None] = mapped_column(Integer, nullable=True)
    feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    graded_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
