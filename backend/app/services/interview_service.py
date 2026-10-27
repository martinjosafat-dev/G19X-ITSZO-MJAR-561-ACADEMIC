import logging
from typing import Any
from uuid import UUID

from langchain_google_genai.chat_models import ChatGoogleGenerativeAIError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.exceptions import (
    AIProviderUnavailableError,
    CandidateNotFoundError,
    InterviewConflictError,
    InterviewNotFoundError,
    InvalidInterviewEvaluationError,
)
from app.models.candidate import Candidate
from app.models.interview import Interview
from app.models.schemas.interview import (
    InterviewCreate,
    InterviewEvaluation,
    InterviewTranscriptResponse,
    RecruiterInterviewSummary,
)
from app.services.ai_service import evaluate_interview, generate_interviewer_response

logger = logging.getLogger(__name__)


async def list_interviews(
    session: AsyncSession,
) -> list[RecruiterInterviewSummary]:
    result = await session.execute(
        select(
            Interview.id,
            Candidate.first_name,
            Candidate.last_name,
            Candidate.email,
            Interview.status,
            Interview.ai_score,
        )
        .join(Candidate, Interview.candidate_id == Candidate.id)
        .order_by(Interview.created_at.desc())
    )
    return [
        RecruiterInterviewSummary(
            id=interview_id,
            candidate_name=f"{first_name} {last_name}",
            candidate_email=email,
            status=interview_status,
            score=score,
        )
        for interview_id, first_name, last_name, email, interview_status, score in result
    ]


async def get_interview_transcript(
    session: AsyncSession,
    interview_id: UUID,
) -> InterviewTranscriptResponse:
    interview = await session.get(Interview, interview_id)
    if interview is None:
        raise InterviewNotFoundError("Interview not found")

    transcript = interview.transcript or []
    return InterviewTranscriptResponse(id=interview.id, transcript=transcript)


async def create_interview(
    session: AsyncSession,
    interview_data: InterviewCreate,
) -> Interview:
    candidate = await session.get(Candidate, interview_data.candidate_id)
    if candidate is None:
        raise CandidateNotFoundError("Candidate not found")

    interview = Interview(
        candidate_id=interview_data.candidate_id,
        status="in_progress",
        transcript=[],
    )
    session.add(interview)
    await session.commit()
    await session.refresh(interview)
    return interview


async def process_chat_message(
    session: AsyncSession,
    interview_id: UUID,
    candidate_message: str,
) -> tuple[Interview, str]:
    interview = await session.get(Interview, interview_id)
    if interview is None:
        raise InterviewNotFoundError("Interview not found")
    if interview.status != "in_progress":
        raise InterviewConflictError("Interview is not in progress")

    transcript: list[dict[str, Any]] = list(interview.transcript or [])
    ai_response = await generate_interviewer_response(transcript, candidate_message)
    updated_transcript = [
        *transcript,
        {"role": "user", "content": candidate_message},
        {"role": "assistant", "content": ai_response},
    ]
    interview.transcript = updated_transcript

    await session.commit()
    await session.refresh(interview)
    return interview, ai_response


async def finish_interview(
    session: AsyncSession,
    interview_id: UUID,
) -> InterviewEvaluation:
    interview = await session.get(Interview, interview_id)
    if interview is None:
        raise InterviewNotFoundError("Interview not found")

    if interview.status == "completed":
        if interview.ai_score is None or interview.evaluation_feedback is None:
            raise InterviewConflictError("Interview evaluation is incomplete")
        return InterviewEvaluation(
            score=int(interview.ai_score),
            feedback=interview.evaluation_feedback,
        )

    if interview.status != "in_progress":
        raise InterviewConflictError("Interview is not in progress")

    transcript: list[dict[str, Any]] = list(interview.transcript or [])
    try:
        evaluation = await evaluate_interview(transcript)
    except ValueError as error:
        raise InvalidInterviewEvaluationError(str(error)) from error
    except ChatGoogleGenerativeAIError as error:
        logger.exception("Gemini failed to evaluate interview %s", interview_id)
        raise AIProviderUnavailableError(
            "The AI evaluation provider could not complete the request. Please retry."
        ) from error

    interview.status = "completed"
    interview.ai_score = float(evaluation.score)
    interview.evaluation_feedback = evaluation.feedback
    await session.commit()
    return evaluation


async def get_interview_evaluation(
    session: AsyncSession,
    interview_id: UUID,
) -> InterviewEvaluation:
    interview = await session.get(Interview, interview_id)
    if interview is None:
        raise InterviewNotFoundError("Interview not found")
    if (
        interview.status != "completed"
        or interview.ai_score is None
        or interview.evaluation_feedback is None
    ):
        raise InterviewConflictError("Interview evaluation is not available")

    return InterviewEvaluation(
        score=int(interview.ai_score),
        feedback=interview.evaluation_feedback,
    )
