# CALMA TECH - Sistema de Apoyo y Gestión Educativa con AI

## 📋 Descripción

Sistema web responsive que permite a profesores y alumnos gestionar actividades, calificaciones y salud mental, usando datos de Google Classroom y potenciado con inteligencia artificial.

## 🎯 Características Principales

### Para Profesores:
- ✅ Gestión de actividades, calificaciones y anuncios
- ✅ Pase de lista digital
- ✅ Creación de grupos personalizados
- ✅ Reportes automáticos de rendimiento
- ✅ Panel de seguimiento del bienestar académico
- ✅ Alertas de riesgo automáticas

### Para Alumnos:
- ✅ Visualización de tareas, anuncios y calificaciones
- ✅ Recomendaciones AI para priorizar tareas
- ✅ Chatbot de apoyo emocional
- ✅ Panel de progreso académico
- ✅ Alertas personalizadas

### IA Integrada:
- 🤖 Análisis predictivo de patrones académicos
- 🤖 Detección de procrastinación y riesgo
- 🤖 Chatbot de apoyo emocional con LangGraph
- 🤖 Recomendaciones personalizadas

## 🛠️ Stack Tecnológico

### Backend:
- **FastAPI** - Framework web
- **PostgreSQL** - Base de datos
- **Supabase** - BaaS para auth y storage
- **LangChain + LangGraph** - Orquestación de IA
- **Ollama + Llama 3.2** - LLM local
- **ChromaDB** - Base de datos vectorial
- **scikit-learn** - Análisis predictivo

### Frontend:
- **React 18** - Framework UI
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **shadcn/ui** - Componentes
- **React Query** - Estado del servidor
- **Zustand** - Estado global

### Integraciones:
- **Google Classroom API** - Datos académicos
- **Google OAuth 2.0** - Autenticación

## 📁 Estructura del Proyecto

```
hackathon_2025/
├── backend/                 # API FastAPI
│   ├── app/
│   │   ├── api/            # Endpoints
│   │   ├── core/           # Configuración
│   │   ├── models/         # Modelos de BD
│   │   ├── services/       # Lógica de negocio
│   │   ├── ai/             # Agentes y cadenas de IA
│   │   └── db/             # Base de datos
│   ├── requirements.txt
│   └── .env.example
├── frontend/                # App React
│   └── (Pendiente configurar)
├── desining/               # Mockups y diseños
├── REQUERIMIENTOS.md       # Documento de requerimientos
├── DESIGN_SPECS.md         # Especificaciones de diseño
└── README.md
```

## 🚀 Instalación

### Prerequisitos:
- Python 3.11+
- Node.js 18+
- Docker + Colima (para PostgreSQL)
- Ollama (opcional, para IA local)

### 1. Base de Datos (PostgreSQL con Docker):

**Setup automático:**
```bash
./setup_db.sh
```

**O manualmente:**
```bash
colima start
docker-compose up -d
```

Ver: `DATABASE_QUICKSTART.md` para más detalles.

### 2. Backend:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Editar .env con tu OpenAI API key y otras credenciales
uvicorn app.main:app --reload
```

### 3. Frontend:

```bash
cd frontend
npm install
npm run dev
```

## 🔑 Configuración

1. **Supabase**: Crear proyecto en supabase.com
2. **Google Cloud**: Habilitar Classroom API y OAuth 2.0
3. **Ollama**: Instalar y descargar modelo Llama 3.2
   ```bash
   ollama pull llama3.2
   ```

## 📊 Roadmap

- [x] Estructura inicial del proyecto
- [x] Especificaciones de diseño
- [ ] Configuración de base de datos
- [ ] Autenticación con Google OAuth
- [ ] Integración con Google Classroom API
- [ ] Modelos de IA con LangGraph
- [ ] Frontend responsive
- [ ] Chatbot de apoyo emocional
- [ ] Sistema de alertas
- [ ] Testing
- [ ] Deployment

## 📄 Licencia

Proyecto educativo - MIT License

## 👥 Equipo

Proyecto Hackathon 2025

---

**Nota**: Este proyecto usa solo tecnologías open source y gratuitas.
