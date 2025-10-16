from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.base import Base


class Curso(Base):
    __tablename__ = "cursos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    classroom_id = Column(String(255), unique=True, nullable=False)
    nombre = Column(String(500), nullable=False)
    descripcion = Column(Text)
    profesor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    seccion = Column(String(255))
    sala = Column(String(255))
    estado = Column(String(50), default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    profesor = relationship("User", back_populates="cursos_impartidos", foreign_keys=[profesor_id])
    estudiantes = relationship("CursoEstudiante", back_populates="curso")
    tareas = relationship("Tarea", back_populates="curso")
    anuncios = relationship("Anuncio", back_populates="curso")
    metricas = relationship("MetricaEstudiante", back_populates="curso")

    def __repr__(self):
        return f"<Curso {self.nombre}>"


class CursoEstudiante(Base):
    __tablename__ = "curso_estudiantes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    curso_id = Column(UUID(as_uuid=True), ForeignKey("cursos.id", ondelete="CASCADE"), index=True)
    estudiante_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    fecha_inscripcion = Column(DateTime, default=datetime.utcnow)

    # Relationships
    curso = relationship("Curso", back_populates="estudiantes")
    estudiante = relationship("User", back_populates="cursos_inscritos")

    def __repr__(self):
        return f"<CursoEstudiante curso={self.curso_id} estudiante={self.estudiante_id}>"
