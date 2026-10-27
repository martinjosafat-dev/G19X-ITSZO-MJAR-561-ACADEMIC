import pytest
from fastapi import status

from app.api.errors import to_http_exception
from app.domain.exceptions import (
    AIProviderUnavailableError,
    DomainError,
    InterviewNotFoundError,
)


@pytest.mark.parametrize(
    ("error", "expected_status"),
    [
        (InterviewNotFoundError("Interview not found"), status.HTTP_404_NOT_FOUND),
        (
            AIProviderUnavailableError("AI provider unavailable"),
            status.HTTP_502_BAD_GATEWAY,
        ),
    ],
)
def test_domain_error_maps_to_expected_http_status(
    error: DomainError,
    expected_status: int,
) -> None:
    http_error = to_http_exception(error)

    assert http_error.status_code == expected_status
    assert http_error.detail == str(error)
