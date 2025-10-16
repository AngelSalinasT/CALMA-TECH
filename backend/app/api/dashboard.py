import asyncio
import logging

from fastapi import APIRouter, Depends, Header, HTTPException
from googleapiclient.errors import HttpError

from app.services.google_classroom import (
    get_student_dashboard_data,
    get_teacher_dashboard_data,
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
