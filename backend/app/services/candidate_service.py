from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.exceptions import CandidateAlreadyExistsError
from app.models.candidate import Candidate
from app.models.schemas.candidate import CandidateCreate


async def create_candidate(
    session: AsyncSession,
    candidate_data: CandidateCreate,
) -> Candidate:
    existing_candidate = await session.scalar(
        select(Candidate).where(Candidate.email == candidate_data.email)
    )
    if existing_candidate is not None:
        raise CandidateAlreadyExistsError(
            "A candidate with this email already exists"
        )

    candidate = Candidate(**candidate_data.model_dump())
    session.add(candidate)
    await session.commit()
    await session.refresh(candidate)
    return candidate
