import pytest
from fastapi import HTTPException, status

from app.api.security import require_recruiter_key


def test_recruiter_key_matches_configured_key(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("RECRUITER_API_KEY", "expected-key")

    assert require_recruiter_key("expected-key") is None


@pytest.mark.parametrize(
    ("configured_key", "provided_key"),
    [
        ("expected-key", None),
        ("expected-key", "incorrect-key"),
        ("", "provided-key"),
    ],
)
def test_recruiter_key_rejects_missing_or_invalid_key(
    monkeypatch: pytest.MonkeyPatch,
    configured_key: str,
    provided_key: str | None,
) -> None:
    monkeypatch.setenv("RECRUITER_API_KEY", configured_key)

    with pytest.raises(HTTPException) as error:
        require_recruiter_key(provided_key)

    assert error.value.status_code == status.HTTP_401_UNAUTHORIZED
