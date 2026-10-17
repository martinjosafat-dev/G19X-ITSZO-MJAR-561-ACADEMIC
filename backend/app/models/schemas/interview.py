from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class InterviewCreate(BaseModel):
    candidate_id: UUID


class InterviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    candidate_id: UUID
    status: str
    transcript: list[dict[str, Any]] | None
    ai_score: float | None
    created_at: datetime


class ChatMessage(BaseModel):
    message: str = Field(min_length=1)
    response: str | None = None


class InterviewEvaluation(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)

    score: int = Field(ge=1, le=100)
    feedback: str = Field(min_length=1, max_length=1000)


class InterviewEvaluationResponse(BaseModel):
    interview_id: UUID
    score: int
    feedback: str
