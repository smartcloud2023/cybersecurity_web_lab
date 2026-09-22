import enum
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models._mixins import CreatedAtMixin, UUIDPrimaryKeyMixin


class UserRole(str, enum.Enum):
    student = "student"
    instructor = "instructor"
    admin = "admin"


class User(UUIDPrimaryKeyMixin, CreatedAtMixin, Base):
    __tablename__ = "users"

    # Set equal to email at registration for now — a placeholder for
    # whichever external identity provider's ID lands here if/when the
    # blueprint's auth moves off first-party email/password.
    auth_id: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role"), default=UserRole.student
    )

    # Personal information + social identity — all optional, filled in from
    # the profile page after registration rather than at signup.
    first_name: Mapped[str | None] = mapped_column(String(100))
    last_name: Mapped[str | None] = mapped_column(String(100))
    bio: Mapped[str | None] = mapped_column(String(280))
    avatar_url: Mapped[str | None] = mapped_column(String(500))
    github_url: Mapped[str | None] = mapped_column(String(300))
    linkedin_url: Mapped[str | None] = mapped_column(String(300))
    facebook_url: Mapped[str | None] = mapped_column(String(300))
    instagram_url: Mapped[str | None] = mapped_column(String(300))
    x_url: Mapped[str | None] = mapped_column(String(300))
    website_url: Mapped[str | None] = mapped_column(String(300))

    # Email verification. The code itself is real (generated, hashed,
    # time-limited, checked server-side) — see app/core/email.py for why
    # "sending" it is a console log today rather than a real inbox.
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    verification_code_hash: Mapped[str | None] = mapped_column(String(64))
    verification_code_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # TOTP multi-factor auth. mfa_secret is written at /auth/mfa/setup and
    # only takes effect (mfa_enabled=True) once confirmed with a real code
    # at /auth/mfa/confirm, so a setup a user never finishes can't silently
    # protect (or lock out) the account.
    mfa_enabled: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    mfa_secret: Mapped[str | None] = mapped_column(String(64))
