# Quick Start - Base de Datos

## Setup Rápido (3 pasos)

### 1. Iniciar Base de Datos
```bash
./setup_db.sh
```

O manualmente:
```bash
colima start
docker-compose up -d
```

### 2. Verificar que esté corriendo
```bash
docker ps
```

Deberías ver:
- `calmatech_postgres`
- `calmatech_pgadmin`
- `calmatech_redis`

### 3. Probar conexión
```bash
docker exec -it calmatech_postgres psql -U calmatech_user -d calmatech_db
```

## Credenciales

**PostgreSQL:**
```
Host: localhost
Port: 5432
Database: calmatech_db
User: calmatech_user
Password: calmatech_dev_password_2025
```

**pgAdmin (UI Web):**
```
URL: http://localhost:5050
Email: admin@calmatech.local
Password: admin123
```

## Comandos Útiles

```bash
# Ver logs
docker-compose logs -f postgres

# Detener todo
docker-compose down

# Reiniciar
docker-compose restart

# Borrar TODO (¡cuidado!)
docker-compose down -v

# Conectar a PostgreSQL CLI
docker exec -it calmatech_postgres psql -U calmatech_user -d calmatech_db

# Backup
docker exec calmatech_postgres pg_dump -U calmatech_user calmatech_db > backup.sql

# Restore
docker exec -i calmatech_postgres psql -U calmatech_user calmatech_db < backup.sql
```

## Migraciones con Alembic

```bash
cd backend

# Crear migración automática
alembic revision --autogenerate -m "initial migration"

# Aplicar migraciones
alembic upgrade head

# Ver estado actual
alembic current

# Revertir
alembic downgrade -1
```

## Estructura de Tablas

- **users** - Profesores y alumnos
- **cursos** - Cursos de Classroom
- **curso_estudiantes** - Relación cursos ↔ estudiantes
- **tareas** - Tareas/actividades
- **entregas** - Entregas de tareas
- **alertas** - Alertas de IA
- **conversaciones_chat** - Sesiones de chat
- **mensajes_chat** - Mensajes del chatbot
- **metricas_estudiante** - Métricas calculadas
- **anuncios** - Anuncios de profesores

Ver detalles completos en: `DATABASE.md`

## Troubleshooting

**Error: Connection refused**
```bash
colima status  # Verificar que esté corriendo
docker ps      # Ver contenedores activos
```

**Recrear BD desde cero**
```bash
docker-compose down -v  # Borra TODO
docker-compose up -d    # Recrea con init.sql
```

**Ver qué salió mal**
```bash
docker-compose logs postgres
```
