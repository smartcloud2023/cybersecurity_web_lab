from sqlalchemy import JSON, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models._mixins import UUIDPrimaryKeyMixin


class Plan(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "plans"

    name: Mapped[str] = mapped_column(String(100), unique=True)
    price_minor_units: Mapped[int] = mapped_column(Integer)
    currency: Mapped[str] = mapped_column(String(3), default="GBP")

    # e.g. {"mentor_hints_per_month": 30, "report_gradings_per_month": 10,
    #       "max_concurrent_sessions": 1, "max_session_minutes": 60}
    limits: Mapped[dict] = mapped_column(JSON, default=dict)
