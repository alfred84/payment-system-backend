"""Process a payment and return an approval decision."""

from __future__ import annotations

from collections.abc import Callable
from uuid import UUID, uuid5

from app.application.ports import RandomSource
from app.domain.processing_decision import ProcessingDecision
from app.domain.value_objects import Amount, CardToken, Currency

APPROVAL_THRESHOLD = 0.8
_REFERENCE_NAMESPACE = UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")


class ProcessPaymentUseCase:
    """Simulate processor approval with deterministic, seeded randomness."""

    def __init__(self, random_source_factory: Callable[[UUID], RandomSource]) -> None:
        """
        Initialize the use case.

        Args:
            random_source_factory: Builds a random source for each payment id.
        """
        self._random_source_factory = random_source_factory

    def execute(
        self,
        amount: Amount,
        currency: Currency,
        card_token: CardToken,
        payment_id: UUID,
    ) -> ProcessingDecision:
        """
        Evaluate a payment and return a processing decision.

        Args:
            amount: Payment amount value object.
            currency: ISO currency code value object.
            card_token: Opaque card token (not persisted here).
            payment_id: Payment identifier used for deterministic seeding.

        Returns:
            Immutable approval or rejection decision.
        """
        _ = amount, currency, card_token

        random_source = self._random_source_factory(payment_id)
        approved = random_source.random() < APPROVAL_THRESHOLD
        reference = uuid5(_REFERENCE_NAMESPACE, str(payment_id))
        message = "Approved" if approved else "Declined"

        return ProcessingDecision(
            approved=approved,
            reference=reference,
            message=message,
        )
