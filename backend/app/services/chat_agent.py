import asyncio
import json
import logging
from collections import deque
from datetime import datetime, timedelta, timezone
from threading import Lock
from typing import Annotated, Any, Deque, Dict, List, Optional, Tuple, Union

import re

from langchain.schema import AIMessage, BaseMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import END, StateGraph
from langgraph.graph.message import add_messages
from typing_extensions import TypedDict

from app.core.config import settings

logger = logging.getLogger(__name__)


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class ChatAgentState(TypedDict):
    messages: Annotated[List[BaseMessage], add_messages]
    context: Dict[str, Any]


class MessageBundle(TypedDict):
    text: str
    utterances: List[str]
    context: Dict[str, Any]


class MessageBuffer:
    """
    Agrupa mensajes rápidos del alumno para enviarlos juntos al agente.
    """

    def __init__(self, window_seconds: float):
        self._window = max(0.1, window_seconds)
        self._sessions: Dict[str, Dict[str, Any]] = {}
        self._lock = asyncio.Lock()

    async def collect(
        self,
        session_id: str,
        message: str,
        context: Optional[Dict[str, Any]] = None,
    ) -> Tuple[MessageBundle, bool]:
        if not message:
            bundle: MessageBundle = {
                "text": "",
                "utterances": [],
                "context": context or {},
            }
            return bundle, True

        async with self._lock:
            entry = self._sessions.get(session_id)
            if not entry:
                event = asyncio.Event()
                entry = {
                    "messages": [message],
                    "context": context or {},
                    "event": event,
                    "bundle": None,
                    "waiters": 1,
                    "leader_assigned": False,
                }
                self._sessions[session_id] = entry
                asyncio.create_task(self._flush_after_delay(session_id))
                primary = True
            else:
                entry["messages"].append(message)
                if context:
                    entry["context"] = context
                entry["waiters"] += 1
                primary = False
            event: asyncio.Event = entry["event"]

        await event.wait()

        async with self._lock:
            entry = self._sessions.get(session_id)
            if not entry:
                raise RuntimeError("Buffer inconsistente para la sesión.")

            bundle: MessageBundle = entry["bundle"]
            if not entry["leader_assigned"]:
                entry["leader_assigned"] = True
                is_primary = True
            else:
                is_primary = False

            entry["waiters"] -= 1
            if entry["waiters"] <= 0:
                self._sessions.pop(session_id, None)

        return bundle, is_primary and primary

    async def _flush_after_delay(self, session_id: str) -> None:
        await asyncio.sleep(self._window)
        async with self._lock:
            entry = self._sessions.get(session_id)
            if not entry:
                return
            bundle: MessageBundle = {
                "text": "\n\n".join(entry["messages"]),
                "utterances": list(entry["messages"]),
                "context": entry["context"],
            }
            entry["bundle"] = bundle
            entry["event"].set()


def split_response_chunks(text: str) -> List[str]:
    """
    Divide la respuesta larga en varios mensajes para entregarlos gradualmente.
    """
    if not text:
        return []

    paragraphs = [part.strip() for part in text.split("\n\n") if part.strip()]
    if not paragraphs:
        paragraphs = [text.strip()]

    chunks: List[str] = []
    for paragraph in paragraphs:
        if len(paragraph) <= 320:
            chunks.append(paragraph)
            continue

        sentences = re.split(r"(?<=[.!?])\s+", paragraph)
        buffer = ""
        for sentence in sentences:
            candidate = f"{buffer} {sentence}".strip() if buffer else sentence
            if len(candidate) <= 280:
                buffer = candidate
            else:
                if buffer:
                    chunks.append(buffer)
                buffer = sentence
        if buffer:
            chunks.append(buffer)

    return chunks


class SessionMemory:
    """
    In-memory storage for recent chat messages per conversation.

    Keeps the last N messages and expires sessions after a TTL.
    """

    def __init__(self, max_messages: int, ttl_seconds: int):
        self._max_messages = max_messages
        self._ttl = timedelta(seconds=ttl_seconds)
        self._sessions: Dict[str, Dict[str, Any]] = {}
        self._lock = Lock()

    def _prune_expired(self) -> None:
        now = _utcnow()
        expired_keys = [
            key for key, payload in self._sessions.items()
            if payload.get("expires_at") and payload["expires_at"] <= now
        ]
        for key in expired_keys:
            logger.debug("Expiring chat session %s due to TTL", key)
            self._sessions.pop(key, None)

    def get_messages(self, session_id: str) -> List[BaseMessage]:
        with self._lock:
            self._prune_expired()
            payload = self._sessions.get(session_id)
            if not payload:
                return []

            # Return a shallow copy to avoid accidental mutation
            return list(payload["messages"])

    def append_message(self, session_id: str, message: BaseMessage) -> None:
        with self._lock:
            self._prune_expired()
            payload = self._sessions.setdefault(
                session_id,
                {
                    "messages": deque(maxlen=self._max_messages),  # type: ignore[arg-type]
                    "expires_at": _utcnow() + self._ttl,
                }
            )

            messages: Deque[BaseMessage] = payload["messages"]
            messages.append(message)
            payload["expires_at"] = _utcnow() + self._ttl

    def reset(self, session_id: str) -> None:
        with self._lock:
            self._sessions.pop(session_id, None)


class StudentSupportAgent:
    """
    LangGraph-powered agent specialised in supporting students with academic wellbeing.
    """

    SYSTEM_PROMPT = (
        "Eres CalmaBot, un mentor académico enfocado en cuidar la salud mental y bienestar "
        "de estudiantes. Tu objetivo es brindar apoyo empático, sugerir estrategias para "
        "manejar el estrés académico y acompañar al alumno para que mantenga equilibrio entre "
        "sus metas escolares y su bienestar personal. Ofrece pasos concretos, reconoce sus "
        "esfuerzos y promueve hábitos saludables (sueño, pausas activas, pedir ayuda). "
        "Evita dar diagnósticos médicos; en situaciones serias recomienda acudir a un profesional.\n\n"
        "Instrucciones de estilo para cada respuesta:\n"
        "- Comunícate con naturalidad y calidez, como un acompañante humano por chat.\n"
        "- Usa frases cortas, tono amable, preguntas ligeras y validación emocional.\n"
        "- Evita conectores formales o lenguaje corporativo (ej. 'por consiguiente', 'en este sentido').\n"
        "- Utiliza emojis con moderación (máximo uno o dos por mensaje) para transmitir cercanía.\n"
        "- Entrega tu respuesta en 2 a 4 mensajes diferenciados por saltos de línea dobles. Cada mensaje debe ser breve (1 a 3 oraciones).\n"
        "- La primera sección puede incluir un saludo o acercamiento, la siguiente una observación/pregunta, y la última un cierre con compañía o sugerencia suave.\n"
        "- Si el estudiante comparte su nombre o contexto, úsalo de forma respetuosa."
    )

    def __init__(
        self,
        model_name: str,
        temperature: float,
        memory: SessionMemory,
    ) -> None:
        self._memory = memory
        self.model_name = model_name
        self.temperature = temperature
        self._llm = ChatOpenAI(
            model=model_name,
            temperature=temperature,
            api_key=settings.OPENAI_API_KEY,
        )
        self._graph = self._build_graph()

    def _build_graph(self):
        graph = StateGraph(ChatAgentState)
        graph.add_node("chat", self._chat_node)
        graph.set_entry_point("chat")
        graph.add_edge("chat", END)
        return graph.compile()

    def _chat_node(self, state: ChatAgentState) -> Dict[str, Any]:
        history = state.get("messages", [])
        context = state.get("context") or {}

        context_message: Optional[SystemMessage] = None
        if context:
            try:
                serialized = json.dumps(context, ensure_ascii=False, indent=2)
            except (TypeError, ValueError):
                serialized = str(context)
            context_message = SystemMessage(
                content=(
                    "Información adicional del alumno para apoyar mejor:\n"
                    f"{serialized}"
                )
            )

        prompt_messages: List[BaseMessage] = [SystemMessage(content=self.SYSTEM_PROMPT)]
        if context_message:
            prompt_messages.append(context_message)
        prompt_messages.extend(history)

        logger.debug("Invocando modelo con %d mensajes de historial", len(history))
        response = self._llm.invoke(prompt_messages)
        return {"messages": [response]}

    def get_memory(self) -> SessionMemory:
        return self._memory

    async def arun(
        self,
        session_id: str,
        user_message: Union[str, List[str]],
        context: Optional[Dict[str, Any]] = None,
    ) -> AIMessage:
        context = context or {}
        if isinstance(user_message, str):
            utterances = [user_message] if user_message else []
        else:
            utterances = [text for text in user_message if text]

        for utterance in utterances:
            human = HumanMessage(content=utterance)
            self._memory.append_message(session_id, human)
        history = self._memory.get_messages(session_id)

        state: ChatAgentState = {
            "messages": history,
            "context": context,
        }

        result = await self._graph.ainvoke(state)
        ai_messages = result.get("messages", [])
        if not ai_messages:
            raise RuntimeError("El agente no devolvió respuesta.")

        ai_message = ai_messages[-1]
        self._memory.append_message(session_id, ai_message)
        return ai_message


session_memory = SessionMemory(
    max_messages=settings.CHAT_MEMORY_MAX_MESSAGES,
    ttl_seconds=settings.CHAT_SESSION_TTL_SECONDS,
)

message_buffer = MessageBuffer(
    window_seconds=settings.CHAT_BUFFER_SECONDS,
)

student_support_agent = StudentSupportAgent(
    model_name=settings.CHAT_OPENAI_MODEL,
    temperature=settings.CHAT_TEMPERATURE,
    memory=session_memory,
)
