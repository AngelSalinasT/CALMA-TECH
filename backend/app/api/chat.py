import logging
import uuid
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import desc
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.base import get_db
from app.models.chat import ConversacionChat, MensajeChat
from app.models.user import User
from app.services.chat_agent import (
    message_buffer,
    split_response_chunks,
    student_support_agent,
)

router = APIRouter(tags=["chat"])
logger = logging.getLogger(__name__)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    conversation_id: Optional[str] = Field(default=None)
    context: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ChatResponse(BaseModel):
    responses: List[str] = Field(default_factory=list)
    response: str = ""
    conversation_id: str
    queued_messages: int = 0
    buffered: bool = False
    ai_metadata: Dict[str, Any] = Field(default_factory=dict)


def _extract_google_id(authorization: str = Header(...)) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Se requiere el encabezado Authorization.")

    parts = authorization.split(" ", 1)
    if len(parts) != 2:
        raise HTTPException(status_code=401, detail="Formato de Authorization inválido. Usa Bearer token.")

    scheme, token = parts
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=401, detail="Formato de Authorization inválido. Usa Bearer token.")

    if not token.startswith("demo_token_"):
        raise HTTPException(status_code=401, detail="Token de aplicación inválido o expirado.")

    google_id = token.replace("demo_token_", "", 1).strip()

    if not google_id:
        raise HTTPException(status_code=401, detail="No se pudo identificar al usuario de Google.")

    return google_id


def _get_or_create_conversation(
    db: Session,
    conversation_id: Optional[str],
    student: Optional[User],
    first_message: str,
) -> ConversacionChat:
    if not conversation_id and student is not None:
        existing = (
            db.query(ConversacionChat)
            .filter(
                ConversacionChat.estudiante_id == student.id,
                ConversacionChat.activa.is_(True)
            )
            .order_by(desc(ConversacionChat.created_at))
            .first()
        )
        if existing:
            return existing

    if conversation_id:
        try:
            conversation_uuid = uuid.UUID(conversation_id)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="conversation_id inválido.") from exc

        conversation = db.get(ConversacionChat, conversation_uuid)
        if conversation:
            return conversation

        logger.warning("Conversación %s no encontrada; se creará una nueva.", conversation_id)

    conversation = ConversacionChat(
        estudiante_id=getattr(student, "id", None),
        titulo=first_message[:120],
        activa=True,
    )
    db.add(conversation)
    db.flush()
    return conversation


@router.post("/api/chat", response_model=ChatResponse)
async def chat_with_agent(
    payload: ChatRequest,
    google_id: str = Depends(_extract_google_id),
    db: Session = Depends(get_db),
):
    if not settings.OPENAI_API_KEY:
        raise HTTPException(status_code=500, detail="No hay OpenAI API Key configurada.")

    db_available = True
    try:
        student: Optional[User] = (
            db.query(User).filter(User.google_id == google_id).first()
        )
    except SQLAlchemyError as exc:
        db_available = False
        logger.exception("Error consultando usuario %s; se continuará sin persistencia.", google_id)
        try:
            db.rollback()
        except Exception:  # pragma: no cover - rollback best-effort
            pass
        student = None

    try:
        conversation = None
        if db_available:
            conversation = _get_or_create_conversation(
                db=db,
                conversation_id=payload.conversation_id,
                student=student,
                first_message=payload.message,
            )
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover - defensive
        logger.exception("Error creando conversación para %s", google_id)
        if db_available:
            raise HTTPException(status_code=500, detail="No se pudo preparar la conversación.") from exc
        conversation = None

    if conversation:
        session_id = str(conversation.id)
    else:
        session_id = payload.conversation_id or f"mem-{google_id}"

    bundle, is_primary = await message_buffer.collect(
        session_id=session_id,
        message=payload.message,
        context=payload.context,
    )

    if not is_primary:
        return ChatResponse(
            responses=[],
            response="",
            conversation_id=session_id,
            queued_messages=max(0, len(bundle["utterances"]) - 1),
            buffered=True,
            ai_metadata={
                "model": student_support_agent.model_name,
                "temperature": student_support_agent.temperature,
            },
        )

    try:
        ai_message = await student_support_agent.arun(
            session_id=session_id,
            user_message=bundle["utterances"],
            context=bundle["context"],
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Error obteniendo respuesta de IA para usuario %s", google_id)
        raise HTTPException(status_code=502, detail="No pudimos obtener respuesta del asistente.") from exc

    chunks = split_response_chunks(ai_message.content) or [
        "Necesité un momento, pero estoy aquí contigo. ¿Quieres que lo intentemos de nuevo?"
    ]

    if db_available and conversation:
        try:
            user_metadata = dict(payload.metadata or {})
            bot_metadata = {
                "model": student_support_agent.model_name,
                "temperature": student_support_agent.temperature,
                "chunks": len(chunks),
            }

            for utterance in bundle["utterances"]:
                db.add(MensajeChat(
                    conversacion_id=conversation.id,
                    remitente="user",
                    contenido=utterance,
                    metadata_json=user_metadata or None,
                ))

            db.add(MensajeChat(
                conversacion_id=conversation.id,
                remitente="bot",
                contenido=ai_message.content,
                metadata_json=bot_metadata,
            ))
            db.commit()
        except SQLAlchemyError as exc:
            logger.exception("Error persistiendo conversación %s", conversation.id)
            db.rollback()

    return ChatResponse(
        responses=chunks,
        response=chunks[0] if chunks else "",
        conversation_id=session_id,
        queued_messages=max(0, len(bundle["utterances"]) - 1),
        ai_metadata={
            "model": student_support_agent.model_name,
            "temperature": student_support_agent.temperature,
        },
    )
