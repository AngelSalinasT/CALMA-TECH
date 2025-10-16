-- CALMA TECH Database Initialization Script
-- PostgreSQL 15+

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('profesor', 'alumno', 'admin');
CREATE TYPE alert_level AS ENUM ('bajo', 'medio', 'alto', 'critico');
CREATE TYPE alert_type AS ENUM ('procrastinacion', 'bajada_rendimiento', 'inactividad', 'estres', 'otro');
CREATE TYPE task_status AS ENUM ('pendiente', 'en_progreso', 'completada', 'retrasada', 'cancelada');

-- ============================================
-- TABLA: users
-- Almacena información de profesores y alumnos
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    google_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255),
    foto_url TEXT,
    rol user_role NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- TABLA: cursos
-- Cursos de Google Classroom
-- ============================================
CREATE TABLE IF NOT EXISTS cursos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classroom_id VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(500) NOT NULL,
    descripcion TEXT,
    profesor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    seccion VARCHAR(255),
    sala VARCHAR(255),
    estado VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: curso_estudiantes
-- Relación muchos a muchos entre cursos y estudiantes
-- ============================================
CREATE TABLE IF NOT EXISTS curso_estudiantes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
    estudiante_id UUID REFERENCES users(id) ON DELETE CASCADE,
    fecha_inscripcion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(curso_id, estudiante_id)
);

-- ============================================
-- TABLA: tareas
-- Tareas/actividades del curso
-- ============================================
CREATE TABLE IF NOT EXISTS tareas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classroom_id VARCHAR(255) UNIQUE,
    curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
    titulo VARCHAR(500) NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_limite TIMESTAMP WITH TIME ZONE,
    puntos_maximos DECIMAL(10,2),
    estado task_status DEFAULT 'pendiente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: entregas
-- Entregas de tareas por estudiantes
-- ============================================
CREATE TABLE IF NOT EXISTS entregas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tarea_id UUID REFERENCES tareas(id) ON DELETE CASCADE,
    estudiante_id UUID REFERENCES users(id) ON DELETE CASCADE,
    fecha_entrega TIMESTAMP WITH TIME ZONE,
    estado VARCHAR(50) DEFAULT 'NEW',
    calificacion DECIMAL(10,2),
    comentarios TEXT,
    retrasada BOOLEAN DEFAULT false,
    minutos_retraso INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tarea_id, estudiante_id)
);

-- ============================================
-- TABLA: asistencia
-- Registro de asistencia de estudiantes
-- ============================================
CREATE TABLE IF NOT EXISTS asistencia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
    estudiante_id UUID REFERENCES users(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    presente BOOLEAN NOT NULL,
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(curso_id, estudiante_id, fecha)
);

-- ============================================
-- TABLA: grupos
-- Grupos personalizados creados por profesores
-- ============================================
CREATE TABLE IF NOT EXISTS grupos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    profesor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    curso_id UUID REFERENCES cursos(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: grupo_estudiantes
-- Estudiantes asignados a grupos
-- ============================================
CREATE TABLE IF NOT EXISTS grupo_estudiantes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grupo_id UUID REFERENCES grupos(id) ON DELETE CASCADE,
    estudiante_id UUID REFERENCES users(id) ON DELETE CASCADE,
    fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(grupo_id, estudiante_id)
);

-- ============================================
-- TABLA: alertas
-- Alertas de riesgo generadas por IA
-- ============================================
CREATE TABLE IF NOT EXISTS alertas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estudiante_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tipo alert_type NOT NULL,
    nivel alert_level NOT NULL,
    titulo VARCHAR(500) NOT NULL,
    mensaje TEXT NOT NULL,
    datos_contexto JSONB,
    leida BOOLEAN DEFAULT false,
    resuelta BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: conversaciones_chat
-- Sesiones de chat con el bot de IA
-- ============================================
CREATE TABLE IF NOT EXISTS conversaciones_chat (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estudiante_id UUID REFERENCES users(id) ON DELETE CASCADE,
    titulo VARCHAR(255),
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: mensajes_chat
-- Mensajes individuales del chat
-- ============================================
CREATE TABLE IF NOT EXISTS mensajes_chat (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversacion_id UUID REFERENCES conversaciones_chat(id) ON DELETE CASCADE,
    remitente VARCHAR(50) NOT NULL, -- 'user' o 'bot'
    contenido TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: anuncios
-- Anuncios publicados por profesores
-- ============================================
CREATE TABLE IF NOT EXISTS anuncios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classroom_id VARCHAR(255) UNIQUE,
    curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
    profesor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    titulo VARCHAR(500),
    contenido TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: metricas_estudiante
-- Métricas calculadas por IA sobre el rendimiento
-- ============================================
CREATE TABLE IF NOT EXISTS metricas_estudiante (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estudiante_id UUID REFERENCES users(id) ON DELETE CASCADE,
    curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
    fecha_calculo DATE NOT NULL,
    promedio_general DECIMAL(5,2),
    tasa_entregas_tiempo DECIMAL(5,2),
    tasa_asistencia DECIMAL(5,2),
    nivel_riesgo alert_level,
    puntuacion_procrastinacion DECIMAL(5,2),
    datos_adicionales JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(estudiante_id, curso_id, fecha_calculo)
);

-- ============================================
-- ÍNDICES para optimizar consultas
-- ============================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_rol ON users(rol);
CREATE INDEX idx_cursos_profesor_id ON cursos(profesor_id);
CREATE INDEX idx_curso_estudiantes_curso_id ON curso_estudiantes(curso_id);
CREATE INDEX idx_curso_estudiantes_estudiante_id ON curso_estudiantes(estudiante_id);
CREATE INDEX idx_tareas_curso_id ON tareas(curso_id);
CREATE INDEX idx_tareas_fecha_limite ON tareas(fecha_limite);
CREATE INDEX idx_entregas_tarea_id ON entregas(tarea_id);
CREATE INDEX idx_entregas_estudiante_id ON entregas(estudiante_id);
CREATE INDEX idx_entregas_fecha_entrega ON entregas(fecha_entrega);
CREATE INDEX idx_alertas_estudiante_id ON alertas(estudiante_id);
CREATE INDEX idx_alertas_nivel ON alertas(nivel);
CREATE INDEX idx_alertas_leida ON alertas(leida);
CREATE INDEX idx_conversaciones_estudiante_id ON conversaciones_chat(estudiante_id);
CREATE INDEX idx_mensajes_conversacion_id ON mensajes_chat(conversacion_id);
CREATE INDEX idx_metricas_estudiante_id ON metricas_estudiante(estudiante_id);

-- ============================================
-- FUNCIÓN: Actualizar timestamp automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS para actualizar updated_at
-- ============================================
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cursos_updated_at BEFORE UPDATE ON cursos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tareas_updated_at BEFORE UPDATE ON tareas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entregas_updated_at BEFORE UPDATE ON entregas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grupos_updated_at BEFORE UPDATE ON grupos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alertas_updated_at BEFORE UPDATE ON alertas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversaciones_updated_at BEFORE UPDATE ON conversaciones_chat
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anuncios_updated_at BEFORE UPDATE ON anuncios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Datos iniciales de prueba (opcional)
-- ============================================
-- Se pueden agregar usuarios de prueba aquí si es necesario

COMMENT ON TABLE users IS 'Usuarios del sistema (profesores y alumnos)';
COMMENT ON TABLE cursos IS 'Cursos importados de Google Classroom';
COMMENT ON TABLE tareas IS 'Tareas y actividades de los cursos';
COMMENT ON TABLE entregas IS 'Entregas de tareas por estudiantes';
COMMENT ON TABLE alertas IS 'Alertas de riesgo generadas por IA';
COMMENT ON TABLE conversaciones_chat IS 'Sesiones de chat con el bot de apoyo emocional';
COMMENT ON TABLE mensajes_chat IS 'Mensajes individuales del chatbot';
COMMENT ON TABLE metricas_estudiante IS 'Métricas calculadas sobre rendimiento académico';
