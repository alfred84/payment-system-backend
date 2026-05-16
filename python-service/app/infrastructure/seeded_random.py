"""Seeded pseudo-random number generator."""

from __future__ import annotations

import hashlib
import random
from uuid import UUID


def seed_for_payment(payment_id: UUID, base_seed: int) -> int:
    """
    Derive a stable integer seed from a payment id and configuration seed.

    Args:
        payment_id: Payment UUID from the caller.
        base_seed: Global processor seed from settings.

    Returns:
        Deterministic 64-bit seed suitable for ``random.Random``.
    """
    digest = hashlib.sha256(f"{payment_id}:{base_seed}".encode()).digest()
    return int.from_bytes(digest[:8], "big")


class SeededRandom:
    """``RandomSource`` implementation backed by ``random.Random``."""

    def __init__(self, seed: int) -> None:
        self._rng = random.Random(seed)

    def random(self) -> float:
        """Return the next float in [0, 1)."""
        return self._rng.random()
