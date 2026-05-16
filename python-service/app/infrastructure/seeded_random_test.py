"""Tests for SeededRandom."""

from uuid import UUID

from app.infrastructure.seeded_random import SeededRandom, seed_for_payment


def test_seed_for_payment_is_stable() -> None:
    """Payment seed helper is deterministic across calls."""
    payment_id = UUID("dddddddd-dddd-4ddd-8ddd-dddddddddddd")
    assert seed_for_payment(payment_id, 42) == seed_for_payment(payment_id, 42)


def test_seeded_random_is_deterministic() -> None:
    """SeededRandom returns the same sequence for the same seed."""
    first = SeededRandom(99)
    second = SeededRandom(99)
    assert [first.random() for _ in range(3)] == [second.random() for _ in range(3)]
