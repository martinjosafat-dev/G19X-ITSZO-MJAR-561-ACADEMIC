from typing import Any
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.candidate import Candidate
from app.models.interview import Interview
from app.models.schemas.interview import InterviewCreate, InterviewEvaluation
from app.services.ai_service import evaluate_interview, generate_interviewer_response


async def create_interview(
    session: AsyncSession,
    interview_data: InterviewCreate,
) -> Interview:
    candidate = await session.get(Candidate, interview_data.candidate_id)
    if candidate is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found",
        )

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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found",
        )
    if interview.status != "in_progress":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Interview is not in progress",
        )

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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found",
        )

    if interview.status == "completed":
        if interview.ai_score is None or interview.evaluation_feedback is None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Interview evaluation is incomplete",
            )
        return InterviewEvaluation(
            score=int(interview.ai_score),
            feedback=interview.evaluation_feedback,
        )

    if interview.status != "in_progress":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Interview is not in progress",
        )

    transcript: list[dict[str, Any]] = list(interview.transcript or [])
    try:
        evaluation = await evaluate_interview(transcript)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found",
        )
    if (
        interview.status != "completed"
        or interview.ai_score is None
        or interview.evaluation_feedback is None
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Interview evaluation is not available",
        )

    return InterviewEvaluation(
        score=int(interview.ai_score),
        feedback=interview.evaluation_feedback,
    )
