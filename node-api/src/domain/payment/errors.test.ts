import {
  IdempotencyConflictError,
  IdempotencyRaceError,
  IllegalStateTransitionError,
  PaymentNotFoundError,
} from './errors';

describe('payment domain errors', () => {
  it('exposes stable error codes', () => {
    expect(new PaymentNotFoundError().code).toBe('PAYMENT_NOT_FOUND');
    expect(new IdempotencyConflictError().code).toBe('IDEMPOTENCY_CONFLICT');
    expect(new IdempotencyRaceError().code).toBe('IDEMPOTENCY_RACE');
    expect(new IllegalStateTransitionError('PENDING', 'APPROVED').code).toBe(
      'ILLEGAL_STATE_TRANSITION',
    );
  });
});
