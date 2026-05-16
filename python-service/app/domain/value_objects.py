"""Domain value objects for payment processing."""

from __future__ import annotations

import re
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation

_CURRENCY_PATTERN = re.compile(r"^[A-Z]{3}$")


@dataclass(frozen=True, slots=True)
class Amount:
    """Positive monetary amount with at most two decimal places."""

    value: float

    def __init__(self, value: float) -> None:
        try:
            decimal_value = Decimal(str(value))
        except (InvalidOperation, ValueError) as error:
            raise ValueError("Amount must be a valid number") from error

        if decimal_value <= 0:
            raise ValueError("Amount must be positive")

        if decimal_value.as_tuple().exponent < -2:
            raise ValueError("Amount must have at most 2 decimal places")

        object.__setattr__(self, "value", float(decimal_value))


@dataclass(frozen=True, slots=True)
class Currency:
    """ISO 4217 currency code."""

    code: str

    def __init__(self, code: str) -> None:
        normalized = code.strip().upper()
        if not _CURRENCY_PATTERN.match(normalized):
            raise ValueError("Invalid currency code")
        object.__setattr__(self, "code", normalized)


@dataclass(frozen=True, slots=True)
class CardToken:
    """Opaque processor card token."""

    value: str

    def __init__(self, value: str) -> None:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Invalid card token")
        object.__setattr__(self, "value", normalized)
