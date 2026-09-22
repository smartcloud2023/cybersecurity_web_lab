import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models.user import UserRole


class RegisterRequest(BaseModel):
    email: EmailStr
    # bcrypt silently truncates past 72 bytes — reject upfront rather than
    # let a long password quietly become a shorter effective one.
    password: str = Field(min_length=8, max_length=72)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)


class UserOut(BaseModel):
    id: uuid.UUID
    email: str
    role: UserRole
    first_name: str | None = None
    last_name: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    github_url: str | None = None
    linkedin_url: str | None = None
    facebook_url: str | None = None
    instagram_url: str | None = None
    x_url: str | None = None
    website_url: str | None = None
    email_verified: bool = False
    mfa_enabled: bool = False
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class LoginResponse(BaseModel):
    # Discriminated on mfa_required: either a full session (access_token +
    # user) or an MFA challenge (pending_token only, no session yet).
    mfa_required: bool = False
    access_token: str | None = None
    token_type: str = "bearer"
    user: UserOut | None = None
    pending_token: str | None = None


class ProfileUpdateRequest(BaseModel):
    # All optional and applied with exclude_unset — a field the client
    # doesn't send is left alone, not cleared.
    first_name: str | None = Field(default=None, max_length=100)
    last_name: str | None = Field(default=None, max_length=100)
    bio: str | None = Field(default=None, max_length=280)
    avatar_url: str | None = Field(default=None, max_length=500)
    github_url: str | None = Field(default=None, max_length=300)
    linkedin_url: str | None = Field(default=None, max_length=300)
    facebook_url: str | None = Field(default=None, max_length=300)
    instagram_url: str | None = Field(default=None, max_length=300)
    x_url: str | None = Field(default=None, max_length=300)
    website_url: str | None = Field(default=None, max_length=300)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=72)
    new_password: str = Field(min_length=8, max_length=72)


class VerifyEmailRequest(BaseModel):
    code: str = Field(min_length=6, max_length=6)


class MfaSetupResponse(BaseModel):
    secret: str
    otpauth_uri: str


class MfaConfirmRequest(BaseModel):
    code: str = Field(min_length=6, max_length=6)


class MfaDisableRequest(BaseModel):
    password: str = Field(min_length=1, max_length=72)


class MfaVerifyRequest(BaseModel):
    pending_token: str
    code: str = Field(min_length=6, max_length=6)
