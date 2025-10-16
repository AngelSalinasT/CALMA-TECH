from sqlalchemy import Column, Date, DateTime, ForeignKey, Numeric, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.base import Base
from app.models.alerta import AlertLevel


class MetricaEstudiante(Base):
    __tablename__ = "metricas_estudiante"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    estudiante_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    curso_id = Column(UUID(as_uuid=True), ForeignKey("cursos.id", ondelete="CASCADE"))
    fecha_calculo = Column(Date, nullable=False)
    promedio_general = Column(Numeric(5, 2))
    tasa_entregas_tiempo = Column(Numeric(5, 2))
    tasa_asistencia = Column(Numeric(5, 2))
    nivel_riesgo = Column(Enum(AlertLevel))
    puntuacion_procrastinacion = Column(Numeric(5, 2))
    datos_adicionales = Column(JSONB)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    estudiante = relationship("User", back_populates="metricas")
    curso = relationship("Curso", back_populates="metricas")

    def __repr__(self):
        return f"<MetricaEstudiante estudiante={self.estudiante_id} fecha={self.fecha_calculo}>"
