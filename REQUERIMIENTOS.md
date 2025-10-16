# Documento de Requerimientos para el Proyecto de Gestión Educativa con AI (Standalone)

## 1. Introducción

* **Nombre del Proyecto**: Sistema de Apoyo y Gestión Educativa con AI (Standalone)
* **Objetivo**: Crear un sistema web responsive que permita a profesores y alumnos gestionar actividades, calificaciones y salud mental, usando datos de Google Classroom y potenciado con inteligencia artificial.

## 2. Alcance

* **Versiones**: Una versión para profesores y otra para alumnos.
* **Funcionalidades principales**:

  * **Profesores**: Crear, gestionar y visualizar actividades, calificaciones y anuncios; pasar lista y crear grupos de alumnos en la plataforma.
  * **Alumnos**: Ver actividades, calificaciones, anuncios, recibir recomendaciones y soporte emocional mediante AI.
  * **AI**: Analizar hábitos académicos, generar alertas de riesgo y ofrecer un chatbot de apoyo emocional.

## 3. Requerimientos Funcionales

### 3.1 Profesores

* Autenticación con Google (OAuth 2.0).
* Gestión de actividades: Crear, modificar y eliminar tareas.
* Publicación de anuncios visibles a los alumnos.
* Registro y visualización de calificaciones.
* Pase de lista digital y creación de grupos personalizados.
* Reportes automáticos: ver entregas tardías, promedios, y patrones de comportamiento.
* Panel de seguimiento del bienestar académico (alertas de riesgo).

### 3.2 Alumnos

* Autenticación con Google (OAuth 2.0).
* Visualización de tareas, anuncios y calificaciones.
* Recomendaciones AI: orden de prioridad de tareas según urgencia y dificultad.
* Chatbot de apoyo emocional basado en IA conversacional.
* Panel de progreso académico y alertas personales.

## 4. Requerimientos No Funcionales

* **Tecnologías Web**: Frameworks gratuitos (React, Vue o Svelte para frontend; Node.js o FastAPI para backend).
* **Seguridad**: Implementación de OAuth y cifrado de datos sensibles.
* **Standalone**: Funcionamiento independiente (solo requiere conexión a Classroom API).
* **Escalabilidad**: Soporte para múltiples instituciones y usuarios concurrentes.
* **UI/UX**: Interfaz web moderna, accesible y completamente responsive (adaptable a escritorio, tablet y móvil).
* **Privacidad**: Cumplimiento de normativas (GDPR, FERPA, LFPDPPP en México).

## 5. Integración con Google Classroom

* **API Classroom**: Uso de endpoints para obtener cursos, tareas, calificaciones, entregas y alumnos.
* **Sincronización**: Actualización automática mediante cron jobs o triggers.
* **Almacenamiento local**: Base de datos propia con histórico de datos (asistencia, tareas, entregas, rendimiento).
* **Extensión funcional**: Si Classroom no provee agrupación o estadísticas avanzadas, el sistema las genera internamente.

## 6. Inteligencia Artificial Integrada

* **Análisis predictivo**:

  * Detección de procrastinación crónica (entregas cercanas a la fecha límite).
  * Identificación de patrones nocturnos o irregulares.
  * Bajón repentino de rendimiento o falta de participación.
  * Generación de alertas para tutores/consejeros.
* **Chatbot de Apoyo Emocional**:

  * Basado en modelos locales o APIs (LangChain + LLM local u Ollama).
  * Respuestas empáticas, guías de organización y manejo del estrés.
  * Derivación a consejeros humanos cuando detecte alto riesgo.

## 7. Restricciones y Consideraciones

* Software open source o gratuito.
* Protección estricta de datos personales.
* La IA no reemplaza el contacto humano, solo lo complementa.
* Configurable para distintas instituciones y escalas (modularidad total).

## 8. Arquitectura del Sistema

### 8.1 Backend

* **Lenguaje sugerido**: Python (FastAPI) o Node.js (Express).
* **Funciones principales**:

  * Conexión segura con API de Google Classroom.
  * Procesamiento de entregas, calificaciones y actividad.
  * IA integrada para detección de patrones.
  * API REST para conectar con el frontend web responsive.
* **Base de Datos**: PostgreSQL / Supabase (segura, gratuita, escalable).
* **Tablas principales**: usuarios, cursos, tareas, entregas, calificaciones, alertas, mensajes, configuraciones.

### 8.2 Frontend Web Responsive

* **Framework**: React.js o Vue.js.
* **Diseño**: Completamente responsive con enfoque mobile-first.
* **Funciones**:

  * Panel de control para profesores y consejeros (adaptable a cualquier dispositivo).
  * Panel de estudiantes para visualización de tareas, calificaciones y anuncios.
  * Visualización de alertas y analíticas de rendimiento.
  * Acceso al chatbot AI integrado.
  * Autenticación con Google OAuth 2.0.
  * Navegación optimizada para pantallas táctiles y escritorio.
  * Progressive Web App (PWA) opcional para experiencia similar a app nativa.

## 9. Diagramas y Estructura de Datos (Resumen)

**Entidades principales:**

* **Usuario:** id, nombre, rol (profesor/alumno), correo, foto, token.
* **Curso:** id, nombre, profesor_id, periodo.
* **Tarea:** id, curso_id, título, fecha_entrega, estado, calificación.
* **Entrega:** id, alumno_id, tarea_id, hora_entrega, calificación, retraso.
* **Alerta:** id, alumno_id, tipo, riesgo, fecha, mensaje.
* **Mensaje:** id, remitente, receptor, tipo (chatbot/humano), contenido.

## 10. Roadmap de Desarrollo

1. **Fase 1:** Configuración del backend (API Classroom + BD local + autenticación).
2. **Fase 2:** Interfaz web responsive base (autenticación + navegación + componentes core).
3. **Fase 3:** Panel para profesores (gestión de actividades + alertas + reportes).
4. **Fase 4:** Panel para alumnos (tareas + calificaciones + chatbot AI).
5. **Fase 5:** Integración de IA predictiva (LangChain, embeddings, patrones).
6. **Fase 6:** Optimización responsive, PWA y testing.
7. **Fase 7:** Despliegue (en VPS o servidor institucional).

## 11. Conclusión

El proyecto busca optimizar la relación entre rendimiento académico y bienestar emocional en entornos educativos mediante una herramienta standalone, escalable y ética, que usa IA no solo para detectar problemas, sino para generar soluciones empáticas y preventivas.
