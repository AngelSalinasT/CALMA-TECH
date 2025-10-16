from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # App
    PROJECT_NAME: str = "CALMA TECH"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Google OAuth
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str
    GOOGLE_CLASSROOM_SCOPES: str

    # AI/ML (Opcional - comentado para desarrollo rápido)
    # OLLAMA_BASE_URL: str = "http://localhost:11434"
    # OLLAMA_MODEL: str = "llama3.2"
    # EMBEDDINGS_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    # CHROMA_PERSIST_DIRECTORY: str = "./chroma_db"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174"
    ]

    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignorar variables extra del .env

settings = Settings()
