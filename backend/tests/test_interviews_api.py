from fastapi.testclient import TestClient
import pytest

from app.main import app

client = TestClient(app)


def test_health_responds_ok() -> None:
    response = client.get("/health")

    assert response.status_code == 200


def test_list_requires_recruiter_key(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("RECRUITER_API_KEY", "expected-key")

    response = client.get("/api/v1/interviews/")

    assert response.status_code == 401


def test_list_rejects_wrong_key(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("RECRUITER_API_KEY", "expected-key")

    response = client.get(
        "/api/v1/interviews/",
        headers={"X-Recruiter-Key": "wrong-key"},
    )

    assert response.status_code == 401
