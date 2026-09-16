import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models._mixins import UUIDPrimaryKeyMixin, utcnow


class TelemetryEvent(UUIDPrimaryKeyMixin, Base):
    """Raw capture feeding tradecraft scoring (differentiator B).

    Stores hashed/redacted request metadata only — never full request or
    response bodies — per the mentor/telemetry privacy rules in
    docs/blueprint.md §18.
    """

    __tablename__ = "telemetry_events"

    session_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("lab_sessions.id"), index=True
    )
    ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    method: Mapped[str] = mapped_column(String(10))
    path_hash: Mapped[str] = mapped_column(String(128))
    technique_tag: Mapped[str | None] = mapped_column(String(64), nullable=True)


class TradecraftScore(UUIDPrimaryKeyMixin, Base):
    """Computed methodology score for a session (differentiator B)."""

    __tablename__ = "tradecraft_scores"

    session_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("lab_sessions.id"), unique=True, index=True
    )
    diversity_score: Mapped[int] = mapped_column(Integer, default=0)
    noise_score: Mapped[int] = mapped_column(Integer, default=0)
    time_to_first_success_seconds: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )
