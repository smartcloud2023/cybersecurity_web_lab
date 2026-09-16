import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models._mixins import UUIDPrimaryKeyMixin


class SubscriptionStatus(str, enum.Enum):
    trialing = "trialing"
    active = "active"
    past_due = "past_due"
    canceled = "canceled"


class Subscription(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "subscriptions"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    plan_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("plans.id"))
    status: Mapped[SubscriptionStatus] = mapped_column(
        Enum(SubscriptionStatus, name="subscription_status")
    )
    period_end: Mapped[datetime] = mapped_column(DateTime(timezone=True))
