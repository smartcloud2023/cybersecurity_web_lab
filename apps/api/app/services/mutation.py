import random
import secrets
import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.lab import LabVariant


class NoVariantsAvailableError(Exception):
    pass


def draw_variant(db: Session, lab_id: uuid.UUID) -> LabVariant:
    """Picks a random active mutation variant for a lab — the student never
    sees or influences this choice."""
    variants = db.scalars(
        select(LabVariant).where(LabVariant.lab_id == lab_id, LabVariant.active.is_(True))
    ).all()
    if not variants:
        raise NoVariantsAvailableError(f"No active variants configured for lab {lab_id}")
    return random.choice(variants)


def generate_flag() -> str:
    """A unique flag per session — never shared across students, and never
    guessable from one session to the next."""
    return f"FLAG{{{secrets.token_hex(16)}}}"
