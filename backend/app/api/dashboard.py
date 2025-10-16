import asyncio
import logging

from fastapi import APIRouter, Depends, Header, HTTPException
from googleapiclient.errors import HttpError

from app.services.google_classroom import (
    get_student_dashboard_data,
    get_teacher_dashboard_data,
    get_student_courses,
    get_course_detail,
    get_assignment_detail,
    get_prioritized_tasks_with_ai,
)

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])
logger = logging.getLogger(__name__)


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


@router.get("/student")
async def get_student_dashboard(google_id: str = Depends(_extract_google_id)):
    """Obtiene datos del dashboard para alumnos desde Google Classroom."""
    loop = asyncio.get_running_loop()
    try:
        data = await loop.run_in_executor(None, get_student_dashboard_data, google_id)
        return data
    except HttpError as exc:
        logger.exception("Error consultando Classroom para alumno %s", google_id)
        raise HTTPException(
            status_code=502,
            detail=f"Error al consultar Google Classroom: {getattr(exc, 'error_details', None) or str(exc)}"
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Error inesperado al obtener dashboard de alumno %s", google_id)
        raise HTTPException(
            status_code=502,
            detail=f"No pudimos sincronizar con Google Classroom: {exc}"
        )


@router.get("/teacher")
async def get_teacher_dashboard(google_id: str = Depends(_extract_google_id)):
    """Obtiene datos del dashboard para profesores desde Google Classroom."""
    loop = asyncio.get_running_loop()
    try:
        data = await loop.run_in_executor(None, get_teacher_dashboard_data, google_id)
        return data
    except HttpError as exc:
        logger.exception("Error consultando Classroom para profesor %s", google_id)
        raise HTTPException(
            status_code=502,
            detail=f"Error al consultar Google Classroom: {getattr(exc, 'error_details', None) or str(exc)}"
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Error inesperado al obtener dashboard de profesor %s", google_id)
        raise HTTPException(
            status_code=502,
            detail=f"No pudimos sincronizar con Google Classroom: {exc}"
        )


@router.get("/student/courses")
async def get_courses(google_id: str = Depends(_extract_google_id)):
    """Obtiene la lista completa de cursos del estudiante."""
    loop = asyncio.get_running_loop()
    try:
        data = await loop.run_in_executor(None, get_student_courses, google_id)
        return data
    except HttpError as exc:
        logger.exception("Error consultando cursos para alumno %s", google_id)
        raise HTTPException(
            status_code=502,
            detail=f"Error al consultar Google Classroom: {getattr(exc, 'error_details', None) or str(exc)}"
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Error inesperado al obtener cursos de alumno %s", google_id)
        raise HTTPException(
            status_code=502,
            detail=f"No pudimos sincronizar con Google Classroom: {exc}"
        )


@router.get("/student/courses/{course_id}")
async def get_course(course_id: str, google_id: str = Depends(_extract_google_id)):
    """Obtiene detalles de un curso específico."""
    loop = asyncio.get_running_loop()
    try:
        data = await loop.run_in_executor(None, get_course_detail, google_id, course_id)
        return data
    except HttpError as exc:
        logger.exception("Error consultando curso %s para alumno %s", course_id, google_id)
        raise HTTPException(
            status_code=502,
            detail=f"Error al consultar Google Classroom: {getattr(exc, 'error_details', None) or str(exc)}"
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Error inesperado al obtener curso %s de alumno %s", course_id, google_id)
        raise HTTPException(
            status_code=502,
            detail=f"No pudimos sincronizar con Google Classroom: {exc}"
        )


@router.get("/student/courses/{course_id}/assignments/{assignment_id}")
async def get_assignment(
    course_id: str,
    assignment_id: str,
    google_id: str = Depends(_extract_google_id)
):
    """Obtiene detalles de una tarea específica."""
    loop = asyncio.get_running_loop()
    try:
        data = await loop.run_in_executor(None, get_assignment_detail, google_id, course_id, assignment_id)
        return data
    except HttpError as exc:
        logger.exception("Error consultando tarea %s del curso %s para alumno %s", assignment_id, course_id, google_id)
        raise HTTPException(
            status_code=502,
            detail=f"Error al consultar Google Classroom: {getattr(exc, 'error_details', None) or str(exc)}"
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Error inesperado al obtener tarea %s del curso %s de alumno %s", assignment_id, course_id, google_id)
        raise HTTPException(
            status_code=502,
            detail=f"No pudimos sincronizar con Google Classroom: {exc}"
        )


@router.get("/student/tasks/prioritized")
async def get_prioritized_tasks(google_id: str = Depends(_extract_google_id)):
    """
    Obtiene las tareas del estudiante priorizadas por IA.

    La IA analiza:
    - Dificultad estimada de cada tarea
    - Urgencia (fecha de entrega)
    - Complejidad del trabajo

    Retorna tareas ordenadas por prioridad con metadata de IA.
    """
    loop = asyncio.get_running_loop()
    try:
        data = await loop.run_in_executor(None, get_prioritized_tasks_with_ai, google_id)
        return data
    except HttpError as exc:
        logger.exception("Error consultando tareas priorizadas para alumno %s", google_id)
        raise HTTPException(
            status_code=502,
            detail=f"Error al consultar Google Classroom: {getattr(exc, 'error_details', None) or str(exc)}"
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Error inesperado al obtener tareas priorizadas de alumno %s", google_id)
        raise HTTPException(
            status_code=502,
            detail=f"No pudimos priorizar las tareas: {exc}"
        )
