"""Integration tests for the FastAPI application."""

from fastapi.testclient import TestClient

from app.interfaces.api import create_app


def test_health_returns_200() -> None:
    """GET /health returns status ok."""
    client = TestClient(create_app())
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
