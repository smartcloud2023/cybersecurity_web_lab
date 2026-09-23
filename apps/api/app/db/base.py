from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Import every model module here so Base.metadata is fully populated for
# Alembic autogenerate and for Base.metadata.create_all() in tests — a model
# defined but never imported is invisible to both.
from app.models import (  # noqa: E402,F401
    api_key,
    audit,
    auth_session,
    credential,
    lab,
    lab_session,
    mentor,
    passkey,
    plan,
    progress,
    report,
    submission,
    subscription,
    telemetry,
    user,
)
