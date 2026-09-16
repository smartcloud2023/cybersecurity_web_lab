import enum

from sqlalchemy import Enum, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models._mixins import CreatedAtMixin, UUIDPrimaryKeyMixin


class UserRole(str, enum.Enum):
    student = "student"
    instructor = "instructor"
    admin = "admin"


class User(UUIDPrimaryKeyMixin, CreatedAtMixin, Base):
    __tablename__ = "users"

    auth_id: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role"), default=UserRole.student
    )
