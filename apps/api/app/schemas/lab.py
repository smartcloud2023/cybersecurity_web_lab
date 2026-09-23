import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.lab import LabLevel
from app.models.lab_session import LabSessionStatus
from app.models.progress import ProgressStatus


class LabOut(BaseModel):
    id: uuid.UUID
    slug: str
    title: str
    level: LabLevel
    summary: str | None = None

    model_config = {"from_attributes": True}


class LabStepOut(BaseModel):
    id: uuid.UUID
    sequence: int
    instruction: str
    points: int

    model_config = {"from_attributes": True}


class LabDetailOut(LabOut):
    steps: list[LabStepOut] = []


class LabSessionOut(BaseModel):
    id: uuid.UUID
    lab_id: uuid.UUID
    lab_slug: str
    status: LabSessionStatus
    connection_info: str | None = None
    expires_at: datetime | None = None
    last_active_at: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class SubmitFlagRequest(BaseModel):
    flag: str = Field(min_length=1, max_length=200)


class ProgressOut(BaseModel):
    lab_id: uuid.UUID
    lab_slug: str
    lab_title: str
    level: LabLevel
    status: ProgressStatus
    score: int

    model_config = {"from_attributes": True}


class ActivityItemOut(BaseModel):
    session_id: uuid.UUID
    lab_slug: str
    lab_title: str
    status: LabSessionStatus
    score: int | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
