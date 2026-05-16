import type { Payment as PrismaPayment, Prisma } from '@prisma/client';

import { Payment } from '../../../domain/payment/Payment';
import { Currency } from '../../../domain/shared/value-objects/Currency';
import { IdempotencyKey } from '../../../domain/shared/value-objects/IdempotencyKey';

/**
 * Maps between Prisma payment rows and domain {@link Payment} entities.
 */
export const PaymentMapper = {
  /**
   * Convert a persistence row to a domain entity.
   *
   * @param row - Prisma payment record.
   * @returns Domain payment.
   */
  toDomain(row: PrismaPayment): Payment {
    return Payment.restore({
      id: row.id,
      userId: row.userId,
      cardId: row.cardId,
      amount: row.amount.toNumber(),
      currency: Currency.create(row.currency),
      status: row.status,
      idempotencyKey: IdempotencyKey.create(row.idempotencyKey),
      processorReference: row.processorReference,
      processorMessage: row.processorMessage,
      description: row.description,
      metadata: row.metadata as Record<string, unknown>,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  },

  /**
   * Convert a domain entity to Prisma create input.
   *
   * @param payment - Domain payment.
   * @returns Prisma payment create shape.
   */
  toCreateInput(payment: Payment): Prisma.PaymentCreateInput {
    return {
      id: payment.id,
      user: { connect: { id: payment.userId } },
      card: { connect: { id: payment.cardId } },
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      processorReference: payment.processorReference,
      processorMessage: payment.processorMessage,
      idempotencyKey: payment.idempotencyKey,
      description: payment.description,
      metadata: payment.metadata as Prisma.InputJsonValue,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  },

  /**
   * Convert a domain entity to Prisma update input.
   *
   * @param payment - Domain payment.
   * @returns Prisma payment update shape.
   */
  toUpdateInput(payment: Payment): Prisma.PaymentUpdateInput {
    return {
      status: payment.status,
      processorReference: payment.processorReference,
      processorMessage: payment.processorMessage,
      description: payment.description,
      metadata: payment.metadata as Prisma.InputJsonValue,
      updatedAt: payment.updatedAt,
    };
  },
};
