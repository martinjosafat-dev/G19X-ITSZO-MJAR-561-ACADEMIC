from fastapi import HTTPException, status

from app.domain.exceptions import (
    AIProviderUnavailableError,
    CandidateAlreadyExistsError,
    CandidateNotFoundError,
    DomainError,
    InterviewConflictError,
    InterviewNotFoundError,
    InvalidInterviewEvaluationError,
)


def to_http_exception(error: DomainError) -> HTTPException:
    if isinstance(error, CandidateAlreadyExistsError):
        code = status.HTTP_400_BAD_REQUEST
    elif isinstance(error, (CandidateNotFoundError, InterviewNotFoundError)):
        code = status.HTTP_404_NOT_FOUND
    elif isinstance(error, InterviewConflictError):
        code = status.HTTP_409_CONFLICT
    elif isinstance(error, InvalidInterviewEvaluationError):
        code = status.HTTP_400_BAD_REQUEST
    elif isinstance(error, AIProviderUnavailableError):
        code = status.HTTP_502_BAD_GATEWAY
    else:
        raise TypeError(f"No HTTP mapping configured for {type(error).__name__}")

    return HTTPException(status_code=code, detail=str(error))
