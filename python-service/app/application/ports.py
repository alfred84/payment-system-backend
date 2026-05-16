"""Application-layer ports."""

from typing import Protocol


class RandomSource(Protocol):
    """Injectable source of deterministic pseudo-random floats in [0, 1)."""

    def random(self) -> float:
        """Return the next random float in the half-open interval [0, 1)."""
        ...
