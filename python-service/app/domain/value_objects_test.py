"""Tests for domain value objects."""

import pytest

from app.domain.value_objects import Amount, CardToken, Currency


def test_amount_rejects_non_positive() -> None:
    """Negative amounts raise ValueError."""
    with pytest.raises(ValueError, match="positive"):
        Amount(-1)


def test_amount_rejects_zero() -> None:
    """Zero amounts raise ValueError."""
    with pytest.raises(ValueError, match="positive"):
        Amount(0)


def test_amount_rejects_more_than_two_decimal_places() -> None:
    """Amounts with scale greater than 2 raise ValueError."""
    with pytest.raises(ValueError, match="decimal"):
        Amount(1.234)


def test_amount_accepts_valid_value() -> None:
    """Valid amounts are stored."""
    amount = Amount(19.99)
    assert amount.value == 19.99


def test_currency_rejects_invalid_code() -> None:
    """Non ISO-4217 codes raise ValueError."""
    with pytest.raises(ValueError, match="currency"):
        Currency("us")


def test_currency_accepts_valid_code() -> None:
    """Uppercase 3-letter codes are accepted."""
    currency = Currency("USD")
    assert currency.code == "USD"


def test_card_token_rejects_empty() -> None:
    """Empty card tokens raise ValueError."""
    with pytest.raises(ValueError, match="token"):
        CardToken("")
