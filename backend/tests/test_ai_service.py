import pytest
from langchain_core.messages import AIMessage, HumanMessage
from pydantic import ValidationError

from app.models.schemas.interview import InterviewEvaluation
from app.services.ai_service import _transcript_to_messages


def test_transcript_to_messages_converts_two_turns() -> None:
    messages = _transcript_to_messages(
        [
            {"role": "user", "content": "Tengo experiencia con Python."},
            {"role": "assistant", "content": "¿Qué proyectos has desarrollado?"},
        ]
    )

    assert len(messages) == 2
    assert isinstance(messages[0], HumanMessage)
    assert messages[0].content == "Tengo experiencia con Python."
    assert isinstance(messages[1], AIMessage)
    assert messages[1].content == "¿Qué proyectos has desarrollado?"


def test_transcript_to_messages_rejects_unknown_role() -> None:
    with pytest.raises(ValueError, match="Unsupported transcript role"):
        _transcript_to_messages([{"role": "system", "content": "Unexpected"}])


def test_interview_evaluation_accepts_maximum_score() -> None:
    evaluation = InterviewEvaluation(
        score=100,
        feedback="Respuestas claras y relevantes.",
    )

    assert evaluation.score == 100


def test_interview_evaluation_rejects_score_above_maximum() -> None:
    with pytest.raises(ValidationError):
        InterviewEvaluation(
            score=101,
            feedback="Puntaje fuera de rango.",
        )
