import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, EmailStr, Field


class SessionOut(BaseModel):
    id: uuid.UUID
    user_agent: str | None = None
    ip_address: str | None = None
    created_at: datetime
    last_seen_at: datetime
    is_current: bool

    model_config = {"from_attributes": True}


class AuditEventOut(BaseModel):
    id: uuid.UUID
    action: str
    object: str
    timestamp: datetime

    model_config = {"from_attributes": True}


class ApiKeyOut(BaseModel):
    id: uuid.UUID
    name: str
    prefix: str
    created_at: datetime
    last_used_at: datetime | None = None

    model_config = {"from_attributes": True}


class ApiKeyCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class ApiKeyCreatedOut(ApiKeyOut):
    # The raw key — present only in the create response, never again.
    key: str


class PasskeyOut(BaseModel):
    id: uuid.UUID
    name: str
    created_at: datetime
    last_used_at: datetime | None = None

    model_config = {"from_attributes": True}


class PasskeyRegistrationOptionsOut(BaseModel):
    challenge_token: str
    options: dict[str, Any]


class PasskeyRegistrationVerifyRequest(BaseModel):
    challenge_token: str
    name: str = Field(min_length=1, max_length=100)
    credential: dict[str, Any]


class PasskeyLoginOptionsRequest(BaseModel):
    email: EmailStr


class PasskeyLoginOptionsOut(BaseModel):
    challenge_token: str
    options: dict[str, Any]


class PasskeyLoginVerifyRequest(BaseModel):
    challenge_token: str
    credential: dict[str, Any]
