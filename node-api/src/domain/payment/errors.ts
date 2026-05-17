import { DomainError } from '../shared/DomainError';

/** Thrown when a payment state transition is not allowed. */
export class IllegalStateTransitionError extends DomainError {
  constructor(from: string, to: string) {
    super(`Cannot transition payment from ${from} to ${to}`, 'ILLEGAL_STATE_TRANSITION');
  }
}

/** Thrown when a payment cannot be found. */
export class PaymentNotFoundError extends DomainError {
  constructor() {
    super('Payment not found', 'PAYMENT_NOT_FOUND');
  }
}

/** Thrown when the same idempotency key is reused with a different payload. */
export class IdempotencyConflictError extends DomainError {
  constructor() {
    super('Idempotency key conflict', 'IDEMPOTENCY_CONFLICT');
  }
}

/** Thrown when a concurrent insert lost the idempotency unique race. */
export class IdempotencyRaceError extends DomainError {
  constructor() {
    super('Concurrent idempotency insert', 'IDEMPOTENCY_RACE');
  }
}
