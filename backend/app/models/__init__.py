# Import all models here to make them available for Alembic
from app.models.user import User, UserRole
from app.models.curso import Curso, CursoEstudiante
from app.models.tarea import Tarea, Entrega, TaskStatus
from app.models.alerta import Alerta, AlertLevel, AlertType
from app.models.chat import ConversacionChat, MensajeChat
from app.models.metrica import MetricaEstudiante
from app.models.anuncio import Anuncio

__all__ = [
    "User",
    "UserRole",
    "Curso",
    "CursoEstudiante",
    "Tarea",
    "Entrega",
    "TaskStatus",
    "Alerta",
    "AlertLevel",
    "AlertType",
    "ConversacionChat",
    "MensajeChat",
    "MetricaEstudiante",
    "Anuncio",
]
