import enum
import uuid

from sqlalchemy import JSON, Boolean, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models._mixins import UUIDPrimaryKeyMixin


class LabLevel(str, enum.Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class Lab(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "labs"

    slug: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(200))
    level: Mapped[LabLevel] = mapped_column(Enum(LabLevel, name="lab_level"))
    # Reference to the approved Terraform module for this lab, e.g. "WEB001".
    template: Mapped[str] = mapped_column(String(100))


class LabStep(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "lab_steps"

    lab_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("labs.id"), index=True)
    sequence: Mapped[int] = mapped_column(Integer)
    instruction: Mapped[str] = mapped_column(Text)
    points: Mapped[int] = mapped_column(Integer, default=0)


class LabVariant(UUIDPrimaryKeyMixin, Base):
    """A mutation spec a lab_session can draw from (differentiator A).

    The provisioning worker renders the container's config/env from this
    spec plus the session's drawn seed — students never see or influence it.
    """

    __tablename__ = "lab_variants"

    lab_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("labs.id"), index=True)
    seed: Mapped[str] = mapped_column(String(64), unique=True)
    injection_point: Mapped[str] = mapped_column(String(200))
    param_names: Mapped[list] = mapped_column(JSON, default=list)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
