import type { IdempotencyKey } from '../shared/value-objects/IdempotencyKey';
import type { Payment } from './Payment';

export interface PaymentListQuery {
  userId: string;
  limit: number;
  cursor?: { createdAt: Date; id: string };
}

/**
 * Persistence port for {@link Payment} aggregates.
 */
export interface PaymentRepository {
  /**
   * Find a payment by idempotency key within the deduplication window.
   *
   * @param userId - Owner user UUID.
   * @param idempotencyKey - Client-supplied idempotency key.
   * @param windowStart - Earliest createdAt to consider (24h window).
   * @returns Matching payment or null.
   */
  findByIdempotencyKey(
    userId: string,
    idempotencyKey: IdempotencyKey,
    windowStart: Date,
  ): Promise<Payment | null>;

  /**
   * Find a payment by id scoped to a user.
   *
   * @param id - Payment UUID.
   * @param userId - Owner user UUID.
   * @returns Payment if found and owned, otherwise null.
   */
  findById(id: string, userId: string): Promise<Payment | null>;

  /**
   * List payments for a user with keyset pagination.
   *
   * @param query - List query parameters.
   * @returns Payments page.
   */
  listByUser(query: PaymentListQuery): Promise<Payment[]>;

  /**
   * Insert a new payment.
   *
   * @param payment - Payment entity.
   */
  save(payment: Payment): Promise<void>;

  /**
   * Update an existing payment (status transition).
   *
   * @param payment - Updated payment entity.
   */
  update(payment: Payment): Promise<void>;
}
