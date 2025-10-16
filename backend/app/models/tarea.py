from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Numeric, Boolean, Integer, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.db.base import Base


class TaskStatus(str, enum.Enum):
    pendiente = "pendiente"
    en_progreso = "en_progreso"
    completada = "completada"
    retrasada = "retrasada"
    cancelada = "cancelada"


class Tarea(Base):
    __tablename__ = "tareas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    classroom_id = Column(String(255), unique=True)
    curso_id = Column(UUID(as_uuid=True), ForeignKey("cursos.id", ondelete="CASCADE"), index=True)
    titulo = Column(String(500), nullable=False)
    descripcion = Column(Text)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_limite = Column(DateTime, index=True)
    puntos_maximos = Column(Numeric(10, 2))
    estado = Column(Enum(TaskStatus), default=TaskStatus.pendiente)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    curso = relationship("Curso", back_populates="tareas")
    entregas = relationship("Entrega", back_populates="tarea")

    def __repr__(self):
        return f"<Tarea {self.titulo}>"


class Entrega(Base):
    __tablename__ = "entregas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tarea_id = Column(UUID(as_uuid=True), ForeignKey("tareas.id", ondelete="CASCADE"), index=True)
    estudiante_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    fecha_entrega = Column(DateTime, index=True)
    estado = Column(String(50), default="NEW")
    calificacion = Column(Numeric(10, 2))
    comentarios = Column(Text)
    retrasada = Column(Boolean, default=False)
    minutos_retraso = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    tarea = relationship("Tarea", back_populates="entregas")
    estudiante = relationship("User", back_populates="entregas")

    def __repr__(self):
        return f"<Entrega tarea={self.tarea_id} estudiante={self.estudiante_id}>"
