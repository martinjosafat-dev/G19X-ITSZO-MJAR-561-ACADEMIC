import os
from typing import Annotated, Any, TypedDict

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import add_messages

from app.models.schemas.interview import InterviewEvaluation


class InterviewState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]


def _extract_text_content(content: str | list[str | dict[str, Any]]) -> str:
    if isinstance(content, str):
        return content

    text_parts: list[str] = []
    for block in content:
        if isinstance(block, str):
            text_parts.append(block)
        elif block.get("type") == "text" and isinstance(block.get("text"), str):
            text_parts.append(block["text"])

    response_text = "".join(text_parts)
    if not response_text:
        raise RuntimeError("Google Gemini returned no text in its interview response")
    return response_text


def _create_google_llm() -> ChatGoogleGenerativeAI:
    return ChatGoogleGenerativeAI(
        model=os.getenv("GOOGLE_GENAI_MODEL", "gemini-3.8-flash"),
        google_api_key=os.environ["GOOGLE_API_KEY"],
        temperature=0.7,
    )


def _transcript_to_messages(
    transcript: list[dict[str, Any]],
) -> list[BaseMessage]:
    messages: list[BaseMessage] = []
    for entry in transcript:
        role = entry.get("role")
        content = entry.get("content")
        if not isinstance(content, str):
            raise ValueError("Transcript entries must contain string content")
        if role == "user":
            messages.append(HumanMessage(content=content))
        elif role == "assistant":
            messages.append(AIMessage(content=content))
        else:
            raise ValueError(f"Unsupported transcript role: {role!r}")
    return messages


async def _generate_interviewer_response(state: InterviewState) -> dict[str, list[BaseMessage]]:
    llm = _create_google_llm()
    response = await llm.ainvoke(state["messages"])
    if not isinstance(response, AIMessage):
        raise RuntimeError("Google Gemini returned an invalid interview response")
    response_text = _extract_text_content(response.content)
    return {"messages": [AIMessage(content=response_text)]}


_workflow = StateGraph(InterviewState)
_workflow.add_node("generate_response", _generate_interviewer_response)
_workflow.add_edge(START, "generate_response")
_workflow.add_edge("generate_response", END)
_interview_graph = _workflow.compile()


async def generate_interviewer_response(
    transcript: list[dict[str, Any]],
    candidate_message: str,
) -> str:
    conversation: list[BaseMessage] = [
        SystemMessage(
            content=(
                "Eres un entrevistador profesional de PluriOne. "
                "Conduce una entrevista laboral en español: responde brevemente "
                "al candidato y formula una sola pregunta relevante a la vez."
            )
        )
    ]
    conversation.extend(_transcript_to_messages(transcript))
    conversation.append(HumanMessage(content=candidate_message))
    result = await _interview_graph.ainvoke({"messages": conversation})
    messages = result["messages"]
    if not messages or not isinstance(messages[-1], AIMessage):
        raise RuntimeError("The interview graph did not return an AI response")
    return _extract_text_content(messages[-1].content)


async def evaluate_interview(
    transcript: list[dict[str, Any]],
) -> InterviewEvaluation:
    if not transcript:
        raise ValueError("Cannot evaluate an interview with an empty transcript")

    conversation: list[BaseMessage] = [
        SystemMessage(
            content=(
                "Evalúa la entrevista laboral basándote únicamente en las respuestas "
                "del candidato. Considera claridad, relevancia, ejemplos concretos, "
                "resolución de problemas y comunicación. Devuelve un puntaje entero "
                "del 0 al 100 y retroalimentación técnica y de habilidades blandas, "
                "breve, específica y constructiva. La respuesta debe ser estrictamente "
                "un JSON con los campos score (entero) y feedback (texto), sin texto "
                "fuera del objeto."
            )
        )
    ]
    conversation.extend(_transcript_to_messages(transcript))
    conversation.append(
        HumanMessage(
            content=(
                "Evalúa ahora el desempeño del candidato en todo el historial anterior. "
                "Responde exclusivamente con el JSON estructurado solicitado."
            )
        )
    )

    structured_llm = _create_google_llm().with_structured_output(
        InterviewEvaluation,
        method="json_schema",
    )
    result = await structured_llm.ainvoke(conversation)
    if not isinstance(result, InterviewEvaluation):
        raise RuntimeError("Google Gemini returned an invalid interview evaluation")
    return result
