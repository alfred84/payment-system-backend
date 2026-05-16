"""FastAPI application factory and routes."""

from fastapi import FastAPI

from app.application.process_payment_use_case import ProcessPaymentUseCase
from app.domain.value_objects import Amount, CardToken, Currency
from app.infrastructure.seeded_random import SeededRandom, seed_for_payment
from app.interfaces.error_mapper import value_error_handler
from app.interfaces.schemas import ProcessPaymentRequest, ProcessPaymentResponse
from app.shared.config import get_settings


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = get_settings()
    use_case = ProcessPaymentUseCase(
        lambda payment_id: SeededRandom(
            seed_for_payment(payment_id, settings.processor_approval_seed),
        ),
    )

    app = FastAPI(
        title="Payment Processor",
        description="Internal payment approval/rejection simulator",
        version="0.1.0",
    )
    app.add_exception_handler(ValueError, value_error_handler)

    @app.get("/health")
    def health() -> dict[str, str]:
        """Health check for container orchestration."""
        return {"status": "ok"}

    @app.post("/process", response_model=ProcessPaymentResponse)
    def process_payment(body: ProcessPaymentRequest) -> ProcessPaymentResponse:
        """
        Evaluate a payment and return an approval decision.

        Args:
            body: Validated payment payload from the Node API.

        Returns:
            Approval outcome with a stable processor reference.
        """
        decision = use_case.execute(
            Amount(body.amount),
            Currency(body.currency),
            CardToken(body.card_token),
            body.payment_id,
        )
        return ProcessPaymentResponse(
            approved=decision.approved,
            reference=decision.reference,
            message=decision.message,
        )

    return app
