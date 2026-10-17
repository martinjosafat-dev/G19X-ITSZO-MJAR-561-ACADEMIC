from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class CandidateCreate(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    email: str = Field(min_length=1, max_length=255)
    phone: str | None = Field(default=None, max_length=30)


class CandidateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    first_name: str
    last_name: str
    email: str
    phone: str | None
    created_at: datetime
