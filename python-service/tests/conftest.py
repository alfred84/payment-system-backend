"""Pytest fixtures for the Python service."""

import pytest
from fastapi.testclient import TestClient

from app.interfaces.api import create_app


@pytest.fixture
def client() -> TestClient:
    """HTTP test client for the FastAPI app."""
    return TestClient(create_app())
