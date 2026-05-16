import { Currency } from '../shared/value-objects/Currency';
import { IdempotencyKey } from '../shared/value-objects/IdempotencyKey';
import { IllegalStateTransitionError } from './errors';
import { Payment } from './Payment';

describe('Payment', () => {
  const baseProps = {
    id: '33333333-3333-4333-8333-333333333333',
    userId: '11111111-1111-4111-8111-111111111111',
    cardId: '22222222-2222-4222-8222-222222222222',
    amount: 19.99,
    currency: Currency.create('USD'),
    idempotencyKey: IdempotencyKey.create('8f5b3c2a-1d4e-4a9b-9c3d-2e1f0a9b8c7d'),
    now: new Date('2026-05-16T12:00:00.000Z'),
  };

  it('starts in PENDING status', () => {
    const payment = Payment.create(baseProps);
    expect(payment.status).toBe('PENDING');
  });

  it('transitions from PENDING to APPROVED or REJECTED once', () => {
    const pending = Payment.create(baseProps);
    const approved = pending.markApproved(
      '44444444-4444-4444-8444-444444444444',
      'Approved',
      baseProps.now,
    );
    expect(approved.status).toBe('APPROVED');

    const pending2 = Payment.create(baseProps);
    const rejected = pending2.markRejected('Declined', baseProps.now);
    expect(rejected.status).toBe('REJECTED');
  });

  it('throws when transitioning from a terminal state', () => {
    const approved = Payment.create(baseProps).markApproved(
      '44444444-4444-4444-8444-444444444444',
      'Approved',
      baseProps.now,
    );

    expect(() => approved.markRejected('Declined', baseProps.now)).toThrow(
      IllegalStateTransitionError,
    );
    expect(() =>
      approved.markApproved('55555555-5555-4555-8555-555555555555', 'Again', baseProps.now),
    ).toThrow(IllegalStateTransitionError);
  });

  it('reports terminal status after approval', () => {
    const approved = Payment.create(baseProps).markApproved(
      '44444444-4444-4444-8444-444444444444',
      'Approved',
      baseProps.now,
    );
    expect(approved.isTerminal()).toBe(true);
  });
});
