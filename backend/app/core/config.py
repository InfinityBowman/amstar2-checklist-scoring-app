from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = Field(..., description="SQLAlchemy async URL, e.g. postgresql+asyncpg://user:pass@host:5432/db")

    # API
    API_PREFIX: str = "/api/v1"
    ENV: str = "dev"
    LOG_LEVEL: str = "INFO"

    # CORS
    ALLOWED_ORIGINS: str | list[str] = Field(
        default_factory=lambda: ["http://localhost:5173"],
        description="Comma-separated list or JSON list of allowed origins",
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


def _as_list(v: str | list[str]) -> list[str]:
    if isinstance(v, list):
        return v
    # split comma-separated string
    return [s.strip() for s in v.split(",") if s.strip()]


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    # Normalize ALLOWED_ORIGINS to a list
    if isinstance(settings.ALLOWED_ORIGINS, str):
        settings.ALLOWED_ORIGINS = _as_list(settings.ALLOWED_ORIGINS)
    return settings


# Singleton-style export for convenience
settings = get_settings()

