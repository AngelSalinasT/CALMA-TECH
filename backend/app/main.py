from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title="CALMA TECH API",
    description="Sistema de Apoyo y Gestión Educativa con AI",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "CALMA TECH API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Include routers
from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(dashboard_router)
