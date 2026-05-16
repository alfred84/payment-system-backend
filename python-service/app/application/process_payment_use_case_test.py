"""Tests for ProcessPaymentUseCase."""

from uuid import UUID, uuid4

from app.application.process_payment_use_case import (
    APPROVAL_THRESHOLD,
    ProcessPaymentUseCase,
)
from app.domain.value_objects import Amount, CardToken, Currency
from app.infrastructure.seeded_random import SeededRandom, seed_for_payment


class _FixedRandom:
    """Deterministic random source for unit tests."""

    def __init__(self, values: list[float]) -> None:
        self._values = values
        self._index = 0

    def random(self) -> float:
        value = self._values[self._index % len(self._values)]
        self._index += 1
        return value


def _use_case_with_seed(base_seed: int) -> ProcessPaymentUseCase:
    return ProcessPaymentUseCase(
        lambda payment_id: SeededRandom(seed_for_payment(payment_id, base_seed)),
    )


def test_same_payment_id_yields_same_decision() -> None:
    """The same payment_id always produces the same outcome."""
    use_case = _use_case_with_seed(42)
    payment_id = UUID("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa")
    inputs = (
        Amount(10.0),
        Currency("USD"),
        CardToken("tok_test"),
        payment_id,
    )

    first = use_case.execute(*inputs)
    second = use_case.execute(*inputs)

    assert first == second


def test_different_payment_ids_can_differ() -> None:
    """Distinct payment ids may produce different outcomes."""
    use_case = _use_case_with_seed(42)
    common = (Amount(25.0), Currency("USD"), CardToken("tok_test"))

    outcomes = {use_case.execute(*common, payment_id=uuid4()).approved for _ in range(20)}
    assert True in outcomes
    assert False in outcomes


def test_approximately_eighty_percent_approved_with_seed_42() -> None:
    """Across many payment ids roughly 80% are approved."""
    use_case = _use_case_with_seed(42)
    approved_count = 0
    samples = 1000

    for index in range(samples):
        payment_id = UUID(int=index)
        decision = use_case.execute(
            Amount(1.0),
            Currency("USD"),
            CardToken("tok_test"),
            payment_id,
        )
        if decision.approved:
            approved_count += 1

    approval_rate = approved_count / samples
    assert 0.75 <= approval_rate <= 0.85


def test_uses_injected_random_source_when_provided() -> None:
    """An injected RandomSource overrides the seeded default."""
    use_case = ProcessPaymentUseCase(lambda _payment_id: _FixedRandom([0.1]))
    decision = use_case.execute(
        Amount(5.0),
        Currency("USD"),
        CardToken("tok_test"),
        UUID("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"),
    )
    assert decision.approved is True
    assert decision.message == "Approved"


def test_rejects_when_random_above_threshold() -> None:
    """Values at or above the threshold are rejected."""
    use_case = ProcessPaymentUseCase(
        lambda _payment_id: _FixedRandom([APPROVAL_THRESHOLD]),
    )
    decision = use_case.execute(
        Amount(5.0),
        Currency("USD"),
        CardToken("tok_test"),
        UUID("cccccccc-cccc-4ccc-8ccc-cccccccccccc"),
    )
    assert decision.approved is False
    assert decision.message == "Declined"
