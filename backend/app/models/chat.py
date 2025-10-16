from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.base import Base


class ConversacionChat(Base):
    __tablename__ = "conversaciones_chat"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    estudiante_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    titulo = Column(String(255))
    activa = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    estudiante = relationship("User", back_populates="conversaciones")
    mensajes = relationship("MensajeChat", back_populates="conversacion", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<ConversacionChat {self.id}>"


class MensajeChat(Base):
    __tablename__ = "mensajes_chat"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversacion_id = Column(UUID(as_uuid=True), ForeignKey("conversaciones_chat.id", ondelete="CASCADE"), index=True)
    remitente = Column(String(50), nullable=False)  # 'user' o 'bot'
    contenido = Column(Text, nullable=False)
    metadata = Column(JSONB)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    conversacion = relationship("ConversacionChat", back_populates="mensajes")

    def __repr__(self):
        return f"<MensajeChat {self.remitente} - {self.created_at}>"
