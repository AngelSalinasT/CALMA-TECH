import asyncio
from datetime import datetime, timedelta, timezone
from threading import Lock
from typing import Optional, List, Dict, Any

import httpx
from fastapi import APIRouter, HTTPException
from google.auth.exceptions import RefreshError
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from pydantic import BaseModel

from app.core.config import settings

router = APIRouter()

class GoogleLoginRequest(BaseModel):
    code: Optional[str] = None
    credential: Optional[str] = None

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

_token_store: Dict[str, Dict[str, Any]] = {}
_token_store_lock = Lock()


def _ensure_aware(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)

def store_user_tokens(google_id: str, token_data: Dict[str, Any], scopes: Optional[List[str]] = None) -> None:
    """
    Guarda temporalmente los tokens de Google por usuario.

    Solo se usa en desarrollo; en producción debería persistirse en base de datos segura.
    """
    if not google_id:
        return

    with _token_store_lock:
        current_entry = _token_store.get(google_id, {})
        access_token = token_data.get("access_token") or current_entry.get("access_token")
        refresh_token = token_data.get("refresh_token") or current_entry.get("refresh_token")
        expires_in = token_data.get("expires_in")
        expiry = current_entry.get("expiry")

        if expires_in:
            expiry = datetime.now(timezone.utc) + timedelta(seconds=int(expires_in))
        expiry = _ensure_aware(expiry)

        stored_scopes = scopes or current_entry.get("scopes") or _parse_scopes(settings.GOOGLE_CLASSROOM_SCOPES)

        _token_store[google_id] = {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "expiry": expiry,
            "scopes": stored_scopes,
        }


def get_credentials_for_user(google_id: str) -> Credentials:
    """
    Recupera credenciales de Google para el usuario autenticado, refrescando el token si es necesario.
    """
    with _token_store_lock:
        token_entry = _token_store.get(google_id)

    if not token_entry or not token_entry.get("access_token"):
        raise HTTPException(status_code=401, detail="No hay credenciales de Google activas. Inicia sesión nuevamente.")

    credentials = Credentials(
        token=token_entry.get("access_token"),
        refresh_token=token_entry.get("refresh_token"),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        scopes=token_entry.get("scopes"),
        expiry=_ensure_aware(token_entry.get("expiry")),
    )

    if credentials.expired:
        if not credentials.refresh_token:
            raise HTTPException(status_code=401, detail="El token de Google ha expirado y no hay refresh token disponible.")
        try:
            credentials.refresh(google_requests.Request())
        except RefreshError as exc:
            raise HTTPException(status_code=401, detail=f"No fue posible refrescar el token de Google: {exc}") from exc

        with _token_store_lock:
            _token_store[google_id] = {
                "access_token": credentials.token,
                "refresh_token": credentials.refresh_token,
                "expiry": _ensure_aware(credentials.expiry),
                "scopes": token_entry.get("scopes"),
            }
    return credentials


def _parse_scopes(raw_scopes: Optional[str]) -> List[str]:
    """
    Convierte el string de scopes en una lista, aceptando separadores por espacio o coma.
    """
    if not raw_scopes:
        return ["openid", "profile", "email"]
    return [
        scope.strip()
        for scope in raw_scopes.replace(",", " ").split()
        if scope.strip()
    ]

def _detect_user_role_sync(credentials: Credentials) -> str:
    """
    Lógica sincrónica para detectar el rol del usuario usando la API de Classroom.

    Retorna 'profesor' si detecta permisos o cursos de profesor, 'alumno' en caso contrario.
    """
    try:
        service = build(
            "classroom",
            "v1",
            credentials=credentials,
            cache_discovery=False
        )

        # Primero, revisar permisos explícitos de docente
        try:
            profile = service.userProfiles().get(userId="me").execute()
            permissions = profile.get("permissions", [])
            if any(
                perm.get("permission") == "CREATE_COURSE" or perm.get("permission") == "COURSE_CREATION"
                for perm in permissions
            ):
                return "profesor"
            if profile.get("isTeacher") or profile.get("verifiedTeacher"):
                return "profesor"
        except HttpError:
            # Si el endpoint no está disponible, continuamos con las otras verificaciones
            pass

        # Si no hay permisos explícitos, revisar si tiene cursos como profesor
        try:
            courses = service.courses().list(teacherId="me", pageSize=1).execute()
            if courses.get("courses"):
                return "profesor"
        except HttpError:
            # Los usuarios sin permisos de profesor pueden obtener 403 aquí
            pass

        # Revisar inscripción como alumno para confirmar que tiene acceso
        try:
            courses = service.courses().list(studentId="me", pageSize=1).execute()
            if courses.get("courses"):
                return "alumno"
        except HttpError:
            pass
    except Exception:
        # Cualquier error inesperado devuelve alumno por defecto
        return "alumno"

    # Si no se pudo determinar explícitamente, asumimos alumno
    return "alumno"

async def detect_user_role(credentials: Credentials) -> str:
    """
    Llama a la versión sincrónica en un thread pool para no bloquear el event loop.
    """
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, _detect_user_role_sync, credentials)

async def exchange_code_for_tokens(code: str) -> Dict[str, Any]:
    """
    Intercambia el authorization code por tokens de acceso/refresh en Google.
    """
    token_payload = {
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": "postmessage",
        "grant_type": "authorization_code",
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(
            "https://oauth2.googleapis.com/token",
            data=token_payload,
        )

    if response.status_code != 200:
        detail = response.text
        raise HTTPException(
            status_code=400,
            detail=f"Error al intercambiar código de Google: {detail}",
        )

    return response.json()

@router.post("/google", response_model=LoginResponse)
async def google_login(request: GoogleLoginRequest):
    """
    Endpoint para login con Google OAuth
    Valida el token de Google y detecta el rol del usuario
    """
    try:
        if not request.code and not request.credential:
            raise HTTPException(
                status_code=400,
                detail="Se requiere el código de autorización o credential de Google.",
            )

        token_data: Dict[str, Any] = {}
        id_token_value: Optional[str] = None

        if request.code:
            token_data = await exchange_code_for_tokens(request.code)
            id_token_value = token_data.get("id_token")
        elif request.credential:
            id_token_value = request.credential

        if not id_token_value:
            raise HTTPException(
                status_code=400,
                detail="Google no retornó un id_token válido.",
            )

        # Validar el token de Google
        idinfo = id_token.verify_oauth2_token(
            id_token_value,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )

        # Extraer información del usuario
        email = idinfo.get('email')
        name = idinfo.get('name', '')
        picture = idinfo.get('picture', '')
        google_id = idinfo.get('sub')

        role = 'alumno'

        access_token = token_data.get("access_token")
        refresh_token = token_data.get("refresh_token")
        scopes = _parse_scopes(token_data.get("scope")) if token_data else None

        if access_token:
            credentials = Credentials(
                token=access_token,
                refresh_token=refresh_token,
                token_uri="https://oauth2.googleapis.com/token",
                client_id=settings.GOOGLE_CLIENT_ID,
                client_secret=settings.GOOGLE_CLIENT_SECRET,
                scopes=_parse_scopes(settings.GOOGLE_CLASSROOM_SCOPES),
                expiry=datetime.now(timezone.utc) + timedelta(seconds=int(token_data.get("expires_in", 0))) if token_data.get("expires_in") else None,
            )
            try:
                role = await detect_user_role(credentials)
                store_user_tokens(
                    google_id,
                    token_data,
                    scopes=scopes or _parse_scopes(settings.GOOGLE_CLASSROOM_SCOPES),
                )
            except Exception:
                # Si falla la detección, mantenemos el valor por defecto
                role = 'alumno'
        elif email:
            # Fallback heurístico cuando no hay access token (p.ej. credencial directa)
            lowered_email = email.lower()
            if any(keyword in lowered_email for keyword in ("prof", "teacher", "maestro")):
                role = 'profesor'

        # TODO: Crear o actualizar usuario en la base de datos
        # TODO: Generar JWT token real

        return {
            "access_token": f"demo_token_{google_id}",
            "token_type": "bearer",
            "user": {
                "id": google_id,
                "email": email,
                "name": name,
                "picture": picture,
                "role": role
            }
        }
    except HTTPException:
        raise
    except ValueError as e:
        # Token inválido
        raise HTTPException(status_code=401, detail=f"Token de Google inválido: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en autenticación: {str(e)}")

@router.get("/me")
async def get_current_user():
    """
    Obtiene información del usuario actual
    TODO: Implementar verificación de JWT token
    """
    return {
        "id": "1",
        "email": "demo@calmatech.com",
        "name": "Usuario Demo",
        "role": "student"
    }
