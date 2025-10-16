import itertools
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from app.api.auth import get_credentials_for_user
from app.services.ai_task_prioritizer import prioritize_tasks_with_ai


def _build_service(credentials):
    return build(
        "classroom",
        "v1",
        credentials=credentials,
        cache_discovery=False,
    )


def _ensure_aware(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def _parse_due_datetime(due_date: Optional[Dict[str, int]], due_time: Optional[Dict[str, int]]) -> Optional[datetime]:
    if not due_date:
        return None

    year = due_date.get("year")
    month = due_date.get("month")
    day = due_date.get("day")
    if not (year and month and day):
        return None

    hour = due_time.get("hours", 0) if due_time else 0
    minute = due_time.get("minutes", 0) if due_time else 0
    second = due_time.get("seconds", 0) if due_time else 0

    return _ensure_aware(datetime(year, month, day, hour, minute, second))


def _parse_iso_datetime(value: Optional[str]) -> Optional[datetime]:
    if not value:
        return None
    try:
        # La API retorna timestamps con sufijo Z (UTC). Si no lo trae, asumimos UTC.
        cleaned = value.replace("Z", "+00:00")
        parsed = datetime.fromisoformat(cleaned)
        return _ensure_aware(parsed)
    except ValueError:
        return None


def _humanize_due_date(due_dt: Optional[datetime]) -> str:
    due_dt = _ensure_aware(due_dt)
    if not due_dt:
        return "Sin fecha límite"

    now = datetime.now(timezone.utc)
    delta = due_dt - now

    if delta.total_seconds() < 0:
        return f"Vencida desde {due_dt.strftime('%d/%m/%Y %H:%M')}"

    if delta <= timedelta(hours=6):
        return f"Hoy {due_dt.strftime('%H:%M')}"

    if delta <= timedelta(days=1, hours=6):
        return f"Mañana {due_dt.strftime('%H:%M')}"

    if delta <= timedelta(days=7):
        days = max(1, int(delta.days))
        return f"En {days} día{'s' if days > 1 else ''}"

    return due_dt.strftime('%d/%m/%Y')


def _humanize_timestamp(dt: Optional[datetime]) -> str:
    dt = _ensure_aware(dt)
    if not dt:
        return "Sin información reciente"

    now = datetime.now(timezone.utc)
    delta = now - dt

    if delta.total_seconds() < 0:
        # Para fechas futuras reutilizamos la lógica de vencimiento
        return _humanize_due_date(dt)

    if delta <= timedelta(minutes=1):
        return "Hace instantes"
    if delta <= timedelta(hours=1):
        minutes = int(delta.total_seconds() // 60)
        return f"Hace {minutes} min"
    if delta <= timedelta(days=1):
        hours = int(delta.total_seconds() // 3600)
        return f"Hace {hours} h"
    if delta <= timedelta(days=7):
        days = delta.days
        return f"Hace {days} día{'s' if days > 1 else ''}"

    return dt.strftime('%d/%m/%Y')


def _evaluate_task_status(due_dt: Optional[datetime]) -> str:
    due_dt = _ensure_aware(due_dt)
    if not due_dt:
        return "ok"

    now = datetime.now(timezone.utc)
    if due_dt < now:
        return "critical"
    if due_dt - now <= timedelta(days=2):
        return "warning"
    return "ok"


def _list_courses(service, **kwargs):
    courses: List[Dict[str, Any]] = []
    request = service.courses().list(**kwargs)
    while request is not None:
        response = request.execute()
        courses.extend(response.get("courses", []))
        request = service.courses().list_next(request, response)

        if len(courses) >= 20:
            break

    return courses


def _list_coursework(service, course_id: str, page_size: int = 10):
    coursework = service.courses().courseWork().list(
        courseId=course_id,
        pageSize=page_size,
        orderBy="dueDate desc"
    ).execute()
    return coursework.get("courseWork", [])


def _list_announcements(service, course_id: str, page_size: int = 5):
    announcements = service.courses().announcements().list(
        courseId=course_id,
        pageSize=page_size,
        orderBy="updateTime desc"
    ).execute()
    return announcements.get("announcements", [])


def get_student_dashboard_data(google_id: str) -> Dict[str, Any]:
    credentials = get_credentials_for_user(google_id)
    service = _build_service(credentials)

    try:
        courses = _list_courses(
            service,
            studentId="me",
            courseStates=["ACTIVE"],
            pageSize=10
        )
    except HttpError as exc:
        raise HttpError(exc.resp, exc.content, uri=exc.uri) from exc

    upcoming_tasks: List[Dict[str, Any]] = []
    announcements: List[Dict[str, Any]] = []
    raw_upcoming_tasks: List[Dict[str, Any]] = []

    badge_cycle = itertools.cycle(["blue", "green", "purple", "orange"])

    for course in itertools.islice(courses, 0, 5):
        try:
            coursework_items = _list_coursework(service, course["id"], page_size=10)
        except HttpError:
            coursework_items = []

        for work in coursework_items:
            due_dt = _parse_due_datetime(work.get("dueDate"), work.get("dueTime"))
            raw_upcoming_tasks.append({
                "title": work.get("title", "Sin título"),
                "course": course.get("name"),
                "due": _humanize_due_date(due_dt),
                "status": _evaluate_task_status(due_dt),
                "_due_dt": due_dt,
            })

        try:
            announcement_items = _list_announcements(service, course["id"], page_size=3)
        except HttpError:
            announcement_items = []

        for announcement in announcement_items:
            update_dt = _parse_iso_datetime(announcement.get("updateTime"))
            announcements.append({
                "title": announcement.get("text", "Anuncio sin contenido"),
                "author": course.get("name", "Docente"),
                "course": course.get("name"),
                "time": _humanize_timestamp(update_dt),
            })

    raw_upcoming_tasks.sort(
        key=lambda task: (
            0 if task["status"] == "critical" else 1,
            _ensure_aware(task.get("_due_dt")) or datetime.max.replace(tzinfo=timezone.utc)
        )
    )
    upcoming_tasks = [
        {k: v for k, v in task.items() if k != "_due_dt"}
        for task in raw_upcoming_tasks[:6]
    ]
    announcements = announcements[:6]

    upcoming_this_week = []
    now = datetime.now(timezone.utc)
    for task in raw_upcoming_tasks:
        due_dt = _ensure_aware(task.get("_due_dt"))
        if due_dt and due_dt - now <= timedelta(days=7):
            upcoming_this_week.append(task)

    stats = {
        "pending_tasks": len(upcoming_tasks),
        "pending_this_week": len(upcoming_this_week),
        "average_grade": None,
        "active_courses": len(courses),
    }

    return {
        "stats": stats,
        "upcoming_tasks": upcoming_tasks,
        "announcements": announcements,
    }


def get_student_courses(google_id: str) -> Dict[str, Any]:
    """
    Obtiene la lista completa de cursos del estudiante con información detallada.
    """
    credentials = get_credentials_for_user(google_id)
    service = _build_service(credentials)

    try:
        courses = _list_courses(
            service,
            studentId="me",
            courseStates=["ACTIVE"],
            pageSize=20
        )
    except HttpError as exc:
        raise HttpError(exc.resp, exc.content, uri=exc.uri) from exc

    courses_list = []
    for course in courses:
        # Obtener el número de estudiantes
        student_count = 0
        try:
            students_resp = service.courses().students().list(courseId=course["id"]).execute()
            student_count = len(students_resp.get("students", []))
        except HttpError:
            pass

        # Obtener información del profesor
        teacher_name = None
        try:
            teachers_resp = service.courses().teachers().list(courseId=course["id"]).execute()
            teachers = teachers_resp.get("teachers", [])
            if teachers:
                teacher_profile = teachers[0].get("profile", {})
                teacher_name = teacher_profile.get("name", {}).get("fullName")
        except HttpError:
            pass

        courses_list.append({
            "id": course.get("id"),
            "name": course.get("name"),
            "section": course.get("section"),
            "description": course.get("descriptionHeading"),
            "room": course.get("room"),
            "teacher": teacher_name,
            "studentCount": student_count,
            "courseState": course.get("courseState"),
            "alternateLink": course.get("alternateLink"),
        })

    return {"courses": courses_list}


def get_course_detail(google_id: str, course_id: str) -> Dict[str, Any]:
    """
    Obtiene detalles completos de un curso específico incluyendo tareas, anuncios y materiales.
    """
    credentials = get_credentials_for_user(google_id)
    service = _build_service(credentials)

    # Obtener información del curso
    try:
        course = service.courses().get(id=course_id).execute()
    except HttpError as exc:
        raise HttpError(exc.resp, exc.content, uri=exc.uri) from exc

    # Obtener todas las tareas
    try:
        coursework_items = service.courses().courseWork().list(
            courseId=course_id,
            pageSize=100,
            orderBy="dueDate desc"
        ).execute().get("courseWork", [])
    except HttpError:
        coursework_items = []

    tasks = []
    for work in coursework_items:
        due_dt = _parse_due_datetime(work.get("dueDate"), work.get("dueTime"))
        tasks.append({
            "id": work.get("id"),
            "title": work.get("title"),
            "description": work.get("description"),
            "dueDate": _humanize_due_date(due_dt),
            "status": _evaluate_task_status(due_dt),
            "workType": work.get("workType"),
            "maxPoints": work.get("maxPoints"),
            "alternateLink": work.get("alternateLink"),
            "state": work.get("state"),
        })

    # Obtener anuncios
    try:
        announcement_items = service.courses().announcements().list(
            courseId=course_id,
            pageSize=20,
            orderBy="updateTime desc"
        ).execute().get("announcements", [])
    except HttpError:
        announcement_items = []

    announcements = []
    for announcement in announcement_items:
        update_dt = _parse_iso_datetime(announcement.get("updateTime"))
        announcements.append({
            "id": announcement.get("id"),
            "text": announcement.get("text"),
            "creationTime": _humanize_timestamp(update_dt),
            "alternateLink": announcement.get("alternateLink"),
        })

    # Obtener materiales del curso
    try:
        materials = service.courses().courseWorkMaterials().list(
            courseId=course_id,
            pageSize=20,
            orderBy="updateTime desc"
        ).execute().get("courseWorkMaterial", [])
    except HttpError:
        materials = []

    materials_list = []
    for material in materials:
        materials_list.append({
            "id": material.get("id"),
            "title": material.get("title"),
            "description": material.get("description"),
            "alternateLink": material.get("alternateLink"),
        })

    return {
        "course": {
            "id": course.get("id"),
            "name": course.get("name"),
            "section": course.get("section"),
            "description": course.get("descriptionHeading"),
            "room": course.get("room"),
            "alternateLink": course.get("alternateLink"),
        },
        "tasks": tasks,
        "announcements": announcements,
        "materials": materials_list,
    }


def get_assignment_detail(google_id: str, course_id: str, assignment_id: str) -> Dict[str, Any]:
    """
    Obtiene detalles completos de una tarea específica incluyendo el estado de entrega del estudiante.
    """
    credentials = get_credentials_for_user(google_id)
    service = _build_service(credentials)

    # Obtener información de la tarea
    try:
        assignment = service.courses().courseWork().get(
            courseId=course_id,
            id=assignment_id
        ).execute()
    except HttpError as exc:
        raise HttpError(exc.resp, exc.content, uri=exc.uri) from exc

    # Obtener el estado de entrega del estudiante
    submission = None
    try:
        submissions = service.courses().courseWork().studentSubmissions().list(
            courseId=course_id,
            courseWorkId=assignment_id,
            userId="me"
        ).execute().get("studentSubmissions", [])
        if submissions:
            submission = submissions[0]
    except HttpError:
        pass

    due_dt = _parse_due_datetime(assignment.get("dueDate"), assignment.get("dueTime"))

    # Parsear materiales adjuntos
    materials = []
    for material in assignment.get("materials", []):
        mat_data = {
            "type": None,
            "title": None,
            "url": None,
        }

        if "driveFile" in material:
            drive_file = material["driveFile"]["driveFile"]
            mat_data["type"] = "file"
            mat_data["title"] = drive_file.get("title")
            mat_data["url"] = drive_file.get("alternateLink")
        elif "link" in material:
            link = material["link"]
            mat_data["type"] = "link"
            mat_data["title"] = link.get("title")
            mat_data["url"] = link.get("url")
        elif "youtubeVideo" in material:
            video = material["youtubeVideo"]
            mat_data["type"] = "video"
            mat_data["title"] = video.get("title")
            mat_data["url"] = video.get("alternateLink")

        if mat_data["type"]:
            materials.append(mat_data)

    # Información de la entrega del estudiante
    submission_info = None
    if submission:
        submission_info = {
            "state": submission.get("state"),
            "assignedGrade": submission.get("assignedGrade"),
            "draftGrade": submission.get("draftGrade"),
            "alternateLink": submission.get("alternateLink"),
            "late": submission.get("late"),
        }

    return {
        "assignment": {
            "id": assignment.get("id"),
            "title": assignment.get("title"),
            "description": assignment.get("description"),
            "dueDate": _humanize_due_date(due_dt),
            "status": _evaluate_task_status(due_dt),
            "workType": assignment.get("workType"),
            "maxPoints": assignment.get("maxPoints"),
            "alternateLink": assignment.get("alternateLink"),
            "state": assignment.get("state"),
            "materials": materials,
        },
        "submission": submission_info,
    }


def get_teacher_dashboard_data(google_id: str) -> Dict[str, Any]:
    credentials = get_credentials_for_user(google_id)
    service = _build_service(credentials)

    try:
        courses = _list_courses(
            service,
            teacherId="me",
            courseStates=["ACTIVE"],
            pageSize=10
        )
    except HttpError as exc:
        raise HttpError(exc.resp, exc.content, uri=exc.uri) from exc

    total_students = 0
    today_classes: List[Dict[str, Any]] = []
    pending_assignments: List[Dict[str, Any]] = []

    for course in itertools.islice(courses, 0, 5):
        try:
            students_resp = service.courses().students().list(courseId=course["id"]).execute()
            total_students += len(students_resp.get("students", []))
        except HttpError:
            pass

        section = course.get("section") or course.get("room") or "Sin sección"
        updated_at = _parse_iso_datetime(course.get("updateTime"))
        today_classes.append({
            "title": course.get("name", "Curso sin nombre"),
            "group": section,
            "time": _humanize_timestamp(updated_at),
            "badge": next(badge_cycle),
        })

        try:
            coursework_items = _list_coursework(service, course["id"], page_size=10)
        except HttpError:
            coursework_items = []

        for work in coursework_items:
            due_dt = _parse_due_datetime(work.get("dueDate"), work.get("dueTime"))
            pending_assignments.append({
                "title": work.get("title", "Trabajo sin título"),
                "detail": f"{_humanize_due_date(due_dt)} · {course.get('name', '')}",
                "tone": "yellow" if _evaluate_task_status(due_dt) != "ok" else "green",
            })

    pending_assignments = pending_assignments[:6]

    stats = {
        "active_courses": {"count": len(courses), "summary": f"{total_students} estudiantes totales"},
        "pending_reviews": {"count": len(pending_assignments), "summary": "Trabajos por revisar"},
        "active_alerts": {"count": 0, "summary": "Sin alertas registradas"},
        "today_attendance": {"count": None, "summary": "Sin datos de asistencia"},
    }

    general_stats = {
        "average_grade": None,
        "delivery_rate": None,
        "attendance_rate": None,
    }

    alerts: List[Dict[str, Any]] = []

    return {
        "stats": stats,
        "today_classes": today_classes[:4],
        "pending_assignments": pending_assignments,
        "alerts": alerts,
        "general_stats": general_stats,
    }


def get_prioritized_tasks_with_ai(google_id: str) -> Dict[str, Any]:
    """
    Obtiene las tareas del estudiante y las prioriza usando IA.
    """
    credentials = get_credentials_for_user(google_id)
    service = _build_service(credentials)

    try:
        courses = _list_courses(
            service,
            studentId="me",
            courseStates=["ACTIVE"],
            pageSize=10
        )
    except HttpError as exc:
        raise HttpError(exc.resp, exc.content, uri=exc.uri) from exc

    all_tasks: List[Dict[str, Any]] = []

    for course in itertools.islice(courses, 0, 10):
        try:
            coursework_items = _list_coursework(service, course["id"], page_size=50)
        except HttpError:
            coursework_items = []

        for work in coursework_items:
            due_dt = _parse_due_datetime(work.get("dueDate"), work.get("dueTime"))

            # Incluir más información para que la IA pueda analizar mejor
            all_tasks.append({
                "id": work.get("id"),
                "courseId": course.get("id"),
                "title": work.get("title", "Sin título"),
                "description": work.get("description", ""),
                "course": course.get("name"),
                "due": _humanize_due_date(due_dt),
                "status": _evaluate_task_status(due_dt),
                "maxPoints": work.get("maxPoints"),
                "workType": work.get("workType"),
                "_due_dt": due_dt,
            })

    # Filtrar solo tareas pendientes/próximas
    now = datetime.now(timezone.utc)
    pending_tasks = [
        task for task in all_tasks
        if task.get("_due_dt") is None or _ensure_aware(task.get("_due_dt")) >= now - timedelta(days=1)
    ]

    # Priorizar con IA
    prioritized_tasks = prioritize_tasks_with_ai(pending_tasks)

    # Remover campo temporal _due_dt
    for task in prioritized_tasks:
        task.pop("_due_dt", None)

    return {
        "tasks": prioritized_tasks[:20],  # Limitar a 20 tareas más importantes
        "total_analyzed": len(pending_tasks),
        "ai_powered": True
    }
