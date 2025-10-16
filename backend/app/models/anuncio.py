from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.base import Base


class Anuncio(Base):
    __tablename__ = "anuncios"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    classroom_id = Column(String(255), unique=True)
    curso_id = Column(UUID(as_uuid=True), ForeignKey("cursos.id", ondelete="CASCADE"))
    profesor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    titulo = Column(String(500))
    contenido = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    curso = relationship("Curso", back_populates="anuncios")

    def __repr__(self):
        return f"<Anuncio {self.titulo}>"
