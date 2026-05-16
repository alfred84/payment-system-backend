import type { Currency } from '../shared/value-objects/Currency';
import type { IdempotencyKey } from '../shared/value-objects/IdempotencyKey';
import type { PaymentStatus } from '../shared/value-objects/PaymentStatus';
import { isTerminalPaymentStatus } from '../shared/value-objects/PaymentStatus';
import { IllegalStateTransitionError } from './errors';

export interface CreatePaymentProps {
  id: string;
  userId: string;
  cardId: string;
  amount: number;
  currency: Currency;
  idempotencyKey: IdempotencyKey;
  description?: string;
  metadata?: Record<string, unknown>;
  now: Date;
}

/**
 * Payment aggregate with a strict PENDING → APPROVED | REJECTED state machine.
 */
export class Payment {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly cardId: string,
    public readonly amount: number,
    public readonly currency: Currency,
    public readonly status: PaymentStatus,
    public readonly idempotencyKey: IdempotencyKey,
    public readonly processorReference: string | null,
    public readonly processorMessage: string | null,
    public readonly description: string | null,
    public readonly metadata: Record<string, unknown>,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /**
   * Create a new payment in PENDING status.
   *
   * @param props - Payment creation data.
   * @returns Payment in PENDING state.
   */
  static create(props: CreatePaymentProps): Payment {
    return new Payment(
      props.id,
      props.userId,
      props.cardId,
      props.amount,
      props.currency,
      'PENDING',
      props.idempotencyKey,
      null,
      null,
      props.description ?? null,
      props.metadata ?? {},
      props.now,
      props.now,
    );
  }

  /**
   * Reconstitute a payment from persistence.
   *
   * @param props - Stored payment fields.
   * @returns Payment entity.
   */
  static restore(props: {
    id: string;
    userId: string;
    cardId: string;
    amount: number;
    currency: Currency;
    status: PaymentStatus;
    idempotencyKey: IdempotencyKey;
    processorReference: string | null;
    processorMessage: string | null;
    description: string | null;
    metadata: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
  }): Payment {
    return new Payment(
      props.id,
      props.userId,
      props.cardId,
      props.amount,
      props.currency,
      props.status,
      props.idempotencyKey,
      props.processorReference,
      props.processorMessage,
      props.description,
      props.metadata,
      props.createdAt,
      props.updatedAt,
    );
  }

  /**
   * Mark the payment as approved by the processor.
   *
   * @param processorReference - External processor reference UUID.
   * @param message - Human-readable processor message.
   * @param now - Timestamp of the transition.
   * @returns Updated payment.
   * @throws {IllegalStateTransitionError} When not in PENDING state.
   */
  markApproved(processorReference: string, message: string, now: Date): Payment {
    if (this.status !== 'PENDING') {
      throw new IllegalStateTransitionError(this.status, 'APPROVED');
    }
    return new Payment(
      this.id,
      this.userId,
      this.cardId,
      this.amount,
      this.currency,
      'APPROVED',
      this.idempotencyKey,
      processorReference,
      message,
      this.description,
      this.metadata,
      this.createdAt,
      now,
    );
  }

  /**
   * Mark the payment as rejected by the processor.
   *
   * @param message - Human-readable rejection reason.
   * @param now - Timestamp of the transition.
   * @returns Updated payment.
   * @throws {IllegalStateTransitionError} When not in PENDING state.
   */
  markRejected(message: string, now: Date): Payment {
    if (this.status !== 'PENDING') {
      throw new IllegalStateTransitionError(this.status, 'REJECTED');
    }
    return new Payment(
      this.id,
      this.userId,
      this.cardId,
      this.amount,
      this.currency,
      'REJECTED',
      this.idempotencyKey,
      null,
      message,
      this.description,
      this.metadata,
      this.createdAt,
      now,
    );
  }

  /**
   * Whether the payment has reached a terminal state.
   *
   * @returns True if approved or rejected.
   */
  isTerminal(): boolean {
    return isTerminalPaymentStatus(this.status);
  }
}
