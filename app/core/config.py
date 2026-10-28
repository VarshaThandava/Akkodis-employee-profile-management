"""
Application configuration loaded from environment variables.
Uses python-dotenv via pydantic-settings (env_file=".env").
"""
from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Centralized settings with validation."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = "sqlite:///./hrms_lite.db"
    echo_sql: bool = False
    environment: Literal["development", "staging", "production"] = "development"
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"

    # CORS: comma-separated list of origins (e.g. dev servers + production frontend)
    cors_origins: str = "https://hrsm-frontend.vercel.app"

    @property
    def is_sqlite(self) -> bool:
        """True if using SQLite; False for PostgreSQL (e.g. Supabase)."""
        return self.database_url.startswith("sqlite")

    @property
    def cors_origin_list(self) -> list[str]:
        """CORS allowed origins as a list."""
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
