"""Application settings loaded from environment variables."""

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Validated configuration for the Python payment processor."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    python_service_port: int = Field(default=8000, alias="PYTHON_SERVICE_PORT")
    processor_approval_seed: int = Field(default=42, alias="PROCESSOR_APPROVAL_SEED")
    log_level: str = Field(default="info", alias="LOG_LEVEL")


def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()
