from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.models.schemas.interview import (
    ChatMessage,
    InterviewCreate,
    InterviewEvaluationResponse,
    InterviewResponse,
)
from app.services.interview_service import (
    create_interview,
    finish_interview,
    get_interview_evaluation,
    process_chat_message,
)

router = APIRouter()


@router.post(
    "/interviews/",
    response_model=InterviewResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_interview_endpoint(
    interview_data: InterviewCreate,
    session: AsyncSession = Depends(get_db_session),
) -> InterviewResponse:
    return await create_interview(session, interview_data)


@router.post(
    "/interviews/{interview_id}/chat",
    response_model=ChatMessage,
)
async def process_chat_message_endpoint(
    interview_id: UUID,
    chat_message: ChatMessage,
    session: AsyncSession = Depends(get_db_session),
) -> ChatMessage:
    _, ai_response = await process_chat_message(
        session,
        interview_id,
        chat_message.message,
    )
    return ChatMessage(message=chat_message.message, response=ai_response)


@router.post(
    "/interviews/{interview_id}/finish",
    response_model=InterviewEvaluationResponse,
)
async def finish_interview_endpoint(
    interview_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> InterviewEvaluationResponse:
    evaluation = await finish_interview(session, interview_id)
    return InterviewEvaluationResponse(
        interview_id=interview_id,
        score=evaluation.score,
        feedback=evaluation.feedback,
    )


@router.get(
    "/interviews/{interview_id}/evaluation",
    response_model=InterviewEvaluationResponse,
)
async def get_interview_evaluation_endpoint(
    interview_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> InterviewEvaluationResponse:
    evaluation = await get_interview_evaluation(session, interview_id)
    return InterviewEvaluationResponse(
        interview_id=interview_id,
        score=evaluation.score,
        feedback=evaluation.feedback,
    )
