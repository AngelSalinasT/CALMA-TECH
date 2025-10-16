from sqlalchemy import Column, String, Boolean, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.db.base import Base


class UserRole(str, enum.Enum):
    profesor = "profesor"
    alumno = "alumno"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    google_id = Column(String(255), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    nombre = Column(String(255), nullable=False)
    apellidos = Column(String(255))
    foto_url = Column(String)
    rol = Column(Enum(UserRole), nullable=False, index=True)
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime)

    # Relationships
    cursos_impartidos = relationship("Curso", back_populates="profesor", foreign_keys="Curso.profesor_id")
    cursos_inscritos = relationship("CursoEstudiante", back_populates="estudiante")
    entregas = relationship("Entrega", back_populates="estudiante")
    alertas = relationship("Alerta", back_populates="estudiante")
    conversaciones = relationship("ConversacionChat", back_populates="estudiante")
    metricas = relationship("MetricaEstudiante", back_populates="estudiante")

    def __repr__(self):
        return f"<User {self.email} - {self.rol}>"
