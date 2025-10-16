# Documentación de Base de Datos - CALMA TECH

## Configuración de PostgreSQL con Docker

### Credenciales de Desarrollo

```
Database: calmatech_db
User: calmatech_user
Password: calmatech_dev_password_2025
Host: localhost
Port: 5432
```

### Iniciar Base de Datos con Colima

```bash
# 1. Iniciar Colima (si no está corriendo)
colima start

# 2. Iniciar contenedores
docker-compose up -d

# 3. Verificar que están corriendo
docker ps

# 4. Ver logs si hay problemas
docker-compose logs postgres
```

### Acceso a pgAdmin (Interfaz Gráfica)

URL: http://localhost:5050
- Email: admin@calmatech.local
- Password: admin123

Para conectar a la BD desde pgAdmin:
- Host: postgres (nombre del servicio)
- Port: 5432
- Database: calmatech_db
- Username: calmatech_user
- Password: calmatech_dev_password_2025

### Variables de Entorno

Actualizar en `backend/.env`:

```env
DATABASE_URL=postgresql://calmatech_user:calmatech_dev_password_2025@localhost:5432/calmatech_db
```

## Esquema de Base de Datos

### Diagrama de Relaciones

```
users (profesores/alumnos)
  ├─→ cursos (como profesor)
  ├─→ curso_estudiantes (como alumno)
  ├─→ entregas
  ├─→ alertas
  ├─→ conversaciones_chat
  └─→ metricas_estudiante

cursos
  ├─→ curso_estudiantes
  ├─→ tareas
  ├─→ anuncios
  └─→ metricas_estudiante

tareas
  └─→ entregas

conversaciones_chat
  └─→ mensajes_chat
```

## Tablas Principales

### 1. users
Usuarios del sistema (profesores y alumnos)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Primary key |
| google_id | VARCHAR(255) | ID de Google OAuth (único) |
| email | VARCHAR(255) | Correo electrónico (único) |
| nombre | VARCHAR(255) | Nombre del usuario |
| apellidos | VARCHAR(255) | Apellidos |
| foto_url | TEXT | URL de foto de perfil |
| rol | ENUM | profesor, alumno, admin |
| activo | BOOLEAN | Usuario activo/inactivo |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |
| last_login | TIMESTAMP | Último login |

**Índices:**
- google_id (único)
- email (único)
- rol

### 2. cursos
Cursos importados de Google Classroom

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Primary key |
| classroom_id | VARCHAR(255) | ID del curso en Classroom (único) |
| nombre | VARCHAR(500) | Nombre del curso |
| descripcion | TEXT | Descripción |
| profesor_id | UUID | FK a users |
| seccion | VARCHAR(255) | Sección del curso |
| sala | VARCHAR(255) | Aula/sala |
| estado | VARCHAR(50) | ACTIVE, ARCHIVED, etc. |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

**Índices:**
- profesor_id

### 3. curso_estudiantes
Relación muchos a muchos: cursos ↔ estudiantes

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Primary key |
| curso_id | UUID | FK a cursos |
| estudiante_id | UUID | FK a users |
| fecha_inscripcion | TIMESTAMP | Fecha de inscripción |

**Constraint:** UNIQUE(curso_id, estudiante_id)

### 4. tareas
Tareas y actividades de los cursos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Primary key |
| classroom_id | VARCHAR(255) | ID en Classroom |
| curso_id | UUID | FK a cursos |
| titulo | VARCHAR(500) | Título de la tarea |
| descripcion | TEXT | Descripción detallada |
| fecha_creacion | TIMESTAMP | Fecha de creación |
| fecha_limite | TIMESTAMP | Fecha límite de entrega |
| puntos_maximos | DECIMAL(10,2) | Puntos máximos |
| estado | ENUM | pendiente, en_progreso, completada, retrasada, cancelada |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

**Índices:**
- curso_id
- fecha_limite

### 5. entregas
Entregas de tareas por estudiantes

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Primary key |
| tarea_id | UUID | FK a tareas |
| estudiante_id | UUID | FK a users |
| fecha_entrega | TIMESTAMP | Fecha de entrega |
| estado | VARCHAR(50) | NEW, TURNED_IN, RETURNED, etc. |
| calificacion | DECIMAL(10,2) | Calificación obtenida |
| comentarios | TEXT | Comentarios del profesor |
| retrasada | BOOLEAN | Si fue entregada tarde |
| minutos_retraso | INTEGER | Minutos de retraso |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

**Constraint:** UNIQUE(tarea_id, estudiante_id)

**Índices:**
- tarea_id
- estudiante_id
- fecha_entrega

### 6. alertas
Alertas de riesgo generadas por IA

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Primary key |
| estudiante_id | UUID | FK a users |
| tipo | ENUM | procrastinacion, bajada_rendimiento, inactividad, estres, otro |
| nivel | ENUM | bajo, medio, alto, critico |
| titulo | VARCHAR(500) | Título de la alerta |
| mensaje | TEXT | Descripción detallada |
| datos_contexto | JSONB | Datos adicionales en JSON |
| leida | BOOLEAN | Si fue leída |
| resuelta | BOOLEAN | Si fue resuelta |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

**Índices:**
- estudiante_id
- nivel
- leida

**Ejemplo de datos_contexto:**
```json
{
  "tareas_retrasadas": 5,
  "promedio_anterior": 8.5,
  "promedio_actual": 6.2,
  "dias_inactivo": 7
}
```

### 7. conversaciones_chat
Sesiones de chat con el bot de IA

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Primary key |
| estudiante_id | UUID | FK a users |
| titulo | VARCHAR(255) | Título de la conversación |
| activa | BOOLEAN | Si está activa |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

**Índices:**
- estudiante_id

### 8. mensajes_chat
Mensajes individuales del chatbot

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Primary key |
| conversacion_id | UUID | FK a conversaciones_chat |
| remitente | VARCHAR(50) | 'user' o 'bot' |
| contenido | TEXT | Contenido del mensaje |
| metadata | JSONB | Metadatos adicionales |
| created_at | TIMESTAMP | Fecha de creación |

**Índices:**
- conversacion_id

**Ejemplo de metadata:**
```json
{
  "sentiment": "positive",
  "intent": "buscar_ayuda",
  "entities": ["matematicas", "tarea"]
}
```

### 9. metricas_estudiante
Métricas calculadas por IA sobre rendimiento

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Primary key |
| estudiante_id | UUID | FK a users |
| curso_id | UUID | FK a cursos |
| fecha_calculo | DATE | Fecha del cálculo |
| promedio_general | DECIMAL(5,2) | Promedio de calificaciones |
| tasa_entregas_tiempo | DECIMAL(5,2) | % entregas a tiempo |
| tasa_asistencia | DECIMAL(5,2) | % de asistencia |
| nivel_riesgo | ENUM | bajo, medio, alto, critico |
| puntuacion_procrastinacion | DECIMAL(5,2) | Score de procrastinación (0-100) |
| datos_adicionales | JSONB | Datos extra |
| created_at | TIMESTAMP | Fecha de creación |

**Constraint:** UNIQUE(estudiante_id, curso_id, fecha_calculo)

**Índices:**
- estudiante_id

### 10. anuncios
Anuncios publicados por profesores

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Primary key |
| classroom_id | VARCHAR(255) | ID en Classroom |
| curso_id | UUID | FK a cursos |
| profesor_id | UUID | FK a users |
| titulo | VARCHAR(500) | Título del anuncio |
| contenido | TEXT | Contenido |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

## Tipos ENUM

### user_role
- `profesor`: Profesor del sistema
- `alumno`: Estudiante
- `admin`: Administrador

### alert_level
- `bajo`: Riesgo bajo
- `medio`: Riesgo medio
- `alto`: Riesgo alto
- `critico`: Riesgo crítico

### alert_type
- `procrastinacion`: Procrastinación detectada
- `bajada_rendimiento`: Disminución en rendimiento
- `inactividad`: Inactividad prolongada
- `estres`: Señales de estrés
- `otro`: Otro tipo de alerta

### task_status
- `pendiente`: Tarea pendiente
- `en_progreso`: En progreso
- `completada`: Completada
- `retrasada`: Retrasada
- `cancelada`: Cancelada

## Triggers Automáticos

La base de datos incluye triggers que actualizan automáticamente el campo `updated_at` en las siguientes tablas:
- users
- cursos
- tareas
- entregas
- grupos
- alertas
- conversaciones_chat
- anuncios

## Consultas Útiles

### Ver todos los estudiantes de un curso
```sql
SELECT u.*
FROM users u
JOIN curso_estudiantes ce ON u.id = ce.estudiante_id
WHERE ce.curso_id = 'uuid-del-curso';
```

### Entregas retrasadas por estudiante
```sql
SELECT t.titulo, e.fecha_entrega, e.minutos_retraso
FROM entregas e
JOIN tareas t ON e.tarea_id = t.id
WHERE e.estudiante_id = 'uuid-del-estudiante'
  AND e.retrasada = true
ORDER BY e.fecha_entrega DESC;
```

### Alertas no leídas de nivel alto o crítico
```sql
SELECT * FROM alertas
WHERE estudiante_id = 'uuid-del-estudiante'
  AND leida = false
  AND nivel IN ('alto', 'critico')
ORDER BY created_at DESC;
```

### Métricas más recientes por estudiante
```sql
SELECT * FROM metricas_estudiante
WHERE estudiante_id = 'uuid-del-estudiante'
ORDER BY fecha_calculo DESC
LIMIT 1;
```

## Comandos Docker Útiles

```bash
# Detener contenedores
docker-compose down

# Detener y borrar volúmenes (¡CUIDADO! Borra todos los datos)
docker-compose down -v

# Ver logs en tiempo real
docker-compose logs -f postgres

# Ejecutar comando SQL directo
docker exec -it calmatech_postgres psql -U calmatech_user -d calmatech_db

# Backup de la base de datos
docker exec calmatech_postgres pg_dump -U calmatech_user calmatech_db > backup.sql

# Restaurar backup
docker exec -i calmatech_postgres psql -U calmatech_user calmatech_db < backup.sql
```

## Migraciones con Alembic

```bash
# Crear una nueva migración
alembic revision --autogenerate -m "descripcion del cambio"

# Aplicar migraciones
alembic upgrade head

# Revertir última migración
alembic downgrade -1

# Ver historial
alembic history
```

## Troubleshooting

### Error: "Connection refused"
- Verificar que Colima esté corriendo: `colima status`
- Verificar que los contenedores estén up: `docker ps`

### Error: "Password authentication failed"
- Verificar que el `.env` tenga las credenciales correctas
- Reiniciar contenedores: `docker-compose restart`

### Recrear la base de datos desde cero
```bash
docker-compose down -v
docker-compose up -d
```

Esto borrará todos los datos y ejecutará `init.sql` nuevamente.
