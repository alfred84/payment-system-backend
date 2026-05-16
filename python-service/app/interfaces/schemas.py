"""Pydantic request and response models for the HTTP API."""

from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ProcessPaymentRequest(BaseModel):
    """Inbound payment processing payload."""

    model_config = ConfigDict(extra="forbid")

    payment_id: UUID
    amount: float = Field(gt=0)
    currency: str = Field(min_length=3, max_length=3, pattern=r"^[A-Z]{3}$")
    card_token: str = Field(min_length=1)


class ProcessPaymentResponse(BaseModel):
    """Processor decision returned to the Node API."""

    model_config = ConfigDict(strict=True)

    approved: bool
    reference: UUID
    message: str
