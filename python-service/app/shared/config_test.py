"""Tests for application settings."""

from app.shared.config import Settings, get_settings


def test_settings_load_defaults() -> None:
    """Settings can be instantiated with defaults."""
    settings = Settings()
    assert settings.python_service_port == 8000
    assert settings.processor_approval_seed == 42


def test_get_settings_returns_settings() -> None:
    """get_settings returns a Settings instance."""
    assert isinstance(get_settings(), Settings)
