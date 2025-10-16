import json
import logging
from typing import List, Dict, Any
from openai import OpenAI

from app.core.config import settings

logger = logging.getLogger(__name__)


def prioritize_tasks_with_ai(tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Usa OpenAI para analizar y priorizar tareas basándose en:
    - Dificultad estimada (analizando la descripción)
    - Fecha de entrega
    - Estado actual
    - Puntos asignados

    Retorna las tareas ordenadas por prioridad con metadata adicional de IA.
    """
    if not tasks:
        return []

    try:
        client = OpenAI(api_key=settings.OPENAI_API_KEY)

        # Preparar datos de tareas para el análisis
        tasks_summary = []
        for i, task in enumerate(tasks):
            tasks_summary.append({
                "index": i,
                "title": task.get("title", "Sin título"),
                "description": task.get("description", "")[:200],  # Limitar descripción
                "dueDate": task.get("due", "Sin fecha"),
                "status": task.get("status", "ok"),
                "maxPoints": task.get("maxPoints", 0)
            })

        prompt = f"""Eres un asistente educativo que ayuda a estudiantes a priorizar sus tareas.

Analiza estas {len(tasks_summary)} tareas y determina cuáles deberían tener prioridad ALTA, MEDIA o BAJA.

Criterios de priorización:
1. **Urgencia**: Tareas vencidas o que vencen pronto tienen prioridad ALTA
2. **Dificultad**: Tareas complejas (muchos puntos, descripciones largas, proyectos) necesitan más tiempo → prioridad ALTA
3. **Complejidad**: Palabras clave como "proyecto", "investigación", "análisis", "ensayo" indican alta complejidad
4. **Facilidad**: Tareas simples (lectura, cuestionario corto, pocos puntos) → prioridad BAJA o MEDIA

Tareas:
{json.dumps(tasks_summary, indent=2, ensure_ascii=False)}

Responde ÚNICAMENTE con un JSON válido en este formato (sin texto adicional):
{{
  "prioritized_tasks": [
    {{
      "index": 0,
      "priority": "ALTA|MEDIA|BAJA",
      "difficulty": "ALTA|MEDIA|BAJA",
      "estimated_time": "30min|1h|2h|3h+",
      "reason": "Breve explicación de por qué tiene esta prioridad"
    }}
  ]
}}

Ordena el array por prioridad (ALTA primero, luego MEDIA, luego BAJA)."""

        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "Eres un asistente educativo experto en gestión del tiempo y priorización de tareas para estudiantes."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1500
        )

        ai_response = response.choices[0].message.content.strip()

        # Intentar extraer JSON de la respuesta
        try:
            # A veces la API devuelve markdown con ```json
            if "```json" in ai_response:
                ai_response = ai_response.split("```json")[1].split("```")[0].strip()
            elif "```" in ai_response:
                ai_response = ai_response.split("```")[1].split("```")[0].strip()

            ai_analysis = json.loads(ai_response)
        except json.JSONDecodeError as e:
            logger.error(f"Error al parsear respuesta de IA: {e}")
            logger.error(f"Respuesta recibida: {ai_response}")
            # Fallback: devolver tareas en orden original
            return tasks

        # Mapear el análisis de IA a las tareas originales
        prioritized = []
        priority_order = {"ALTA": 0, "MEDIA": 1, "BAJA": 2}

        for ai_task in ai_analysis.get("prioritized_tasks", []):
            original_index = ai_task.get("index")
            if original_index is not None and 0 <= original_index < len(tasks):
                task_copy = tasks[original_index].copy()

                # Agregar metadata de IA
                task_copy["ai_priority"] = ai_task.get("priority", "MEDIA")
                task_copy["ai_difficulty"] = ai_task.get("difficulty", "MEDIA")
                task_copy["ai_estimated_time"] = ai_task.get("estimated_time", "1h")
                task_copy["ai_reason"] = ai_task.get("reason", "")
                task_copy["ai_analyzed"] = True

                prioritized.append(task_copy)

        # Si falta alguna tarea (por si la IA omitió alguna), agregarla al final
        included_indices = {ai_task.get("index") for ai_task in ai_analysis.get("prioritized_tasks", [])}
        for i, task in enumerate(tasks):
            if i not in included_indices:
                task_copy = task.copy()
                task_copy["ai_priority"] = "MEDIA"
                task_copy["ai_analyzed"] = False
                prioritized.append(task_copy)

        logger.info(f"Tareas priorizadas con IA: {len(prioritized)} tareas analizadas")
        return prioritized

    except Exception as e:
        logger.exception(f"Error al priorizar tareas con IA: {e}")
        # En caso de error, devolver tareas en orden original
        return tasks
