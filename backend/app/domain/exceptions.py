class DomainError(Exception):
    """Base class for errors raised by business rules."""


class CandidateAlreadyExistsError(DomainError):
    pass


class CandidateNotFoundError(DomainError):
    pass


class InterviewNotFoundError(DomainError):
    pass


class InterviewConflictError(DomainError):
    pass


class InvalidInterviewEvaluationError(DomainError):
    pass


class AIProviderUnavailableError(DomainError):
    pass
