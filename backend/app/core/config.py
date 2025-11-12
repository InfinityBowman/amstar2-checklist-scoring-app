from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = Field(..., description="SQLAlchemy async URL, e.g. postgresql+asyncpg://user:pass@host:5432/db")

    # ElectricSQL
    ELECTRIC_URL: str = "http://electric:3000"

    # API
    API_PREFIX: str = "/api/v1"
    ENV: str = "dev"
    LOG_LEVEL: str = "INFO"

    # CORS
    ALLOWED_ORIGINS: str | list[str] = Field(
        default_factory=lambda: ["http://localhost:5173", "https://localhost"],
        description="Comma-separated list or JSON list of allowed origins",
    )

    # JWT Settings
    SECRET_KEY: str = Field(..., description="Secret key for JWT signing")
    ALGORITHM: str = Field(default="HS256", description="JWT algorithm")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=15, description="Access token expiration in minutes")
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7, description="Refresh token expiration in days")

    # SMTP Email Settings
    SMTP_HOST: str = Field(default="smtp.gmail.com", description="SMTP server host")
    SMTP_PORT: int = Field(default=587, description="SMTP server port")
    SMTP_USER: str = Field(default="", description="SMTP username/email")
    SMTP_PASS: str = Field(default="", description="SMTP password/app password")
    EMAIL_FROM: str = Field(default="", description="Email sender address")
    EMAIL_FROM_NAME: str = Field(default="CoRATES", description="Email sender name")
    FRONTEND_URL: str = Field(default="http://localhost:5173", description="Frontend URL for links in emails")

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
