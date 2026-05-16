"""Processing decision returned by the payment processor."""

from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID


@dataclass(frozen=True, slots=True)
class ProcessingDecision:
    """Immutable approval or rejection outcome for a payment."""

    approved: bool
    reference: UUID
    message: str
