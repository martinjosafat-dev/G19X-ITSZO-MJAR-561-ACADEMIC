from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.errors import to_http_exception
from app.db.session import get_db_session
from app.domain.exceptions import DomainError
from app.models.schemas.candidate import CandidateCreate, CandidateResponse
from app.services.candidate_service import create_candidate

router = APIRouter()


@router.post(
    "/candidates/",
    response_model=CandidateResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_candidate_endpoint(
    candidate_data: CandidateCreate,
    session: AsyncSession = Depends(get_db_session),
) -> CandidateResponse:
    try:
        return await create_candidate(session, candidate_data)
    except DomainError as error:
        raise to_http_exception(error) from error
