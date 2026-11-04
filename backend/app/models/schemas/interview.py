from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field
from typing_extensions import TypedDict


class TranscriptEntry(TypedDict):
    role: Literal["user", "assistant"]
    content: str


class InterviewCreate(BaseModel):
    candidate_id: UUID
    position: str = Field(min_length=2, max_length=120)


class InterviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    candidate_id: UUID
    position: str | None
    status: str
    transcript: list[TranscriptEntry] | None
    ai_score: float | None
    created_at: datetime


class InterviewSummary(BaseModel):
    id: UUID
    candidate_name: str
    candidate_email: str
    position: str | None
    status: str
    score: float | None
    created_at: datetime


class InterviewDetail(BaseModel):
    id: UUID
    candidate_name: str
    candidate_email: str
    position: str | None
    status: str
    score: float | None
    created_at: datetime
    transcript: list[TranscriptEntry]
    feedback: str | None


class ChatMessage(BaseModel):
    message: str = Field(min_length=1)
    response: str | None = None


class InterviewEvaluation(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)

    score: int = Field(ge=0, le=100)
    feedback: str = Field(min_length=1, max_length=1000)


class InterviewEvaluationResponse(BaseModel):
    interview_id: UUID
    score: int
    feedback: str
