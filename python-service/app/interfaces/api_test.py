"""Integration tests for the FastAPI application."""

from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from app.interfaces.api import create_app


@pytest.fixture
def client() -> TestClient:
    """HTTP test client for the FastAPI app."""
    return TestClient(create_app())


def test_health_returns_200(client: TestClient) -> None:
    """GET /health returns status ok."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_process_returns_200_with_valid_payload(client: TestClient) -> None:
    """POST /process returns a well-formed decision."""
    payment_id = str(uuid4())
    response = client.post(
        "/process",
        json={
            "payment_id": payment_id,
            "amount": 19.99,
            "currency": "USD",
            "card_token": "tok_test",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert isinstance(body["approved"], bool)
    assert body["reference"]
    assert body["message"] in {"Approved", "Declined"}


def test_process_is_deterministic_for_same_payment_id(client: TestClient) -> None:
    """The same payment_id always yields the same processor outcome."""
    payment_id = str(uuid4())
    payload = {
        "payment_id": payment_id,
        "amount": 10.0,
        "currency": "USD",
        "card_token": "tok_test",
    }
    first = client.post("/process", json=payload).json()
    second = client.post("/process", json=payload).json()
    assert first == second


def test_process_returns_422_for_invalid_body(client: TestClient) -> None:
    """Invalid payloads are rejected by Pydantic."""
    response = client.post(
        "/process",
        json={
            "payment_id": str(uuid4()),
            "amount": -1,
            "currency": "USD",
            "card_token": "tok_test",
        },
    )
    assert response.status_code == 422


def test_process_returns_422_for_missing_field(client: TestClient) -> None:
    """Missing required fields return 422."""
    response = client.post(
        "/process",
        json={
            "payment_id": str(uuid4()),
            "amount": 10.0,
            "currency": "USD",
        },
    )
    assert response.status_code == 422


def test_process_returns_422_for_wrong_type(client: TestClient) -> None:
    """Wrong field types return 422."""
    response = client.post(
        "/process",
        json={
            "payment_id": str(uuid4()),
            "amount": "not-a-number",
            "currency": "USD",
            "card_token": "tok_test",
        },
    )
    assert response.status_code == 422


def test_process_returns_422_for_domain_validation(client: TestClient) -> None:
    """Domain value object failures map to HTTP 422."""
    response = client.post(
        "/process",
        json={
            "payment_id": str(uuid4()),
            "amount": 1.001,
            "currency": "USD",
            "card_token": "tok_test",
        },
    )
    assert response.status_code == 422
