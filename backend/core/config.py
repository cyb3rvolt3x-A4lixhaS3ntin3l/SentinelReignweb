import os
from typing import Optional, List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SentinelReign API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # DB - Supports PostgreSQL, MySQL, SQLite
    # Example: postgresql://user:pass@localhost/dbname
    # Example: mysql+pymysql://user:pass@localhost/dbname
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sentinel_reign.db")
    
    # SMTP Settings for Professional Engagement
    SMTP_SERVER: str = os.getenv("SMTP_SERVER", "localhost")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "1025"))
    SMTP_USER: Optional[str] = os.getenv("SMTP_USER", None)
    SMTP_PASSWORD: Optional[str] = os.getenv("SMTP_PASSWORD", None)
    SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL", "intel@sentinelreign.com")

    # Sec
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "fallback_secret")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 hours for better session persistence

    # AI
    NVIDIA_API_KEY: str = os.getenv("NVIDIA_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    class Config:
        env_file = os.path.join(os.path.dirname(__file__), "../../.env")
        case_sensitive = True

settings = Settings()
