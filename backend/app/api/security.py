import os
import secrets

from fastapi import Header, HTTPException, status


def require_recruiter_key(
    recruiter_key: str | None = Header(default=None, alias="X-Recruiter-Key"),
) -> None:
    expected_key = os.environ.get("RECRUITER_API_KEY")
    if (
        not expected_key
        or recruiter_key is None
        or not secrets.compare_digest(
            recruiter_key.encode("utf-8"),
            expected_key.encode("utf-8"),
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing recruiter API key",
        )
