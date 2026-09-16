import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models._mixins import UUIDPrimaryKeyMixin, utcnow


class MentorInteraction(UUIDPrimaryKeyMixin, Base):
    """Audit trail of AI mentor exchanges (differentiator C).

    `prompt_summary` is the redacted telemetry summary sent to the model —
    never raw student input or raw target responses — per the
    prompt-injection defense in docs/blueprint.md §18.
    """

    __tablename__ = "mentor_interactions"

    session_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("lab_sessions.id"), index=True
    )
    step_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("lab_steps.id"), nullable=True
    )
    prompt_summary: Mapped[str] = mapped_column(Text)
    response: Mapped[str] = mapped_column(Text)
    ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
