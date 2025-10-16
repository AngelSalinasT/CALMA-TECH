from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.db.base import Base


class AlertLevel(str, enum.Enum):
    bajo = "bajo"
    medio = "medio"
    alto = "alto"
    critico = "critico"


class AlertType(str, enum.Enum):
    procrastinacion = "procrastinacion"
    bajada_rendimiento = "bajada_rendimiento"
    inactividad = "inactividad"
    estres = "estres"
    otro = "otro"


class Alerta(Base):
    __tablename__ = "alertas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    estudiante_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    tipo = Column(Enum(AlertType), nullable=False)
    nivel = Column(Enum(AlertLevel), nullable=False, index=True)
    titulo = Column(String(500), nullable=False)
    mensaje = Column(Text, nullable=False)
    datos_contexto = Column(JSONB)
    leida = Column(Boolean, default=False, index=True)
    resuelta = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    estudiante = relationship("User", back_populates="alertas")

    def __repr__(self):
        return f"<Alerta {self.tipo} - {self.nivel}>"
