"""Tests for ProcessingDecision entity."""

from dataclasses import FrozenInstanceError
from uuid import UUID

import pytest

from app.domain.processing_decision import ProcessingDecision


def test_processing_decision_is_frozen() -> None:
    """ProcessingDecision is immutable."""
    decision = ProcessingDecision(
        approved=True,
        reference=UUID("11111111-1111-4111-8111-111111111111"),
        message="Approved",
    )
    with pytest.raises(FrozenInstanceError):
        decision.approved = False  # type: ignore[misc]


def test_processing_decision_equality() -> None:
    """Two decisions with the same fields are equal."""
    reference = UUID("22222222-2222-4222-8222-222222222222")
    left = ProcessingDecision(approved=False, reference=reference, message="Declined")
    right = ProcessingDecision(approved=False, reference=reference, message="Declined")
    assert left == right
