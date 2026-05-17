import type { PrismaClient } from '@prisma/client';

import type { IdempotencyKey } from '../../domain/shared/value-objects/IdempotencyKey';
import type { Payment } from '../../domain/payment/Payment';
import type { PaymentListQuery, PaymentRepository } from '../../domain/payment/PaymentRepository';
import { IdempotencyRaceError } from '../../domain/payment/errors';
import { PaymentMapper } from './mappers/PaymentMapper';
import { isPaymentIdempotencyUniqueViolation } from './prismaErrors';

/**
 * Prisma implementation of {@link PaymentRepository}.
 */
export class PrismaPaymentRepository implements PaymentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /** @inheritdoc */
  async findByIdempotencyKey(
    userId: string,
    idempotencyKey: IdempotencyKey,
    windowStart: Date,
  ): Promise<Payment | null> {
    const row = await this.prisma.payment.findFirst({
      where: {
        userId,
        idempotencyKey,
        createdAt: { gt: windowStart },
      },
    });
    return row ? PaymentMapper.toDomain(row) : null;
  }

  /** @inheritdoc */
  async findById(id: string, userId: string): Promise<Payment | null> {
    const row = await this.prisma.payment.findFirst({
      where: { id, userId },
    });
    return row ? PaymentMapper.toDomain(row) : null;
  }

  /** @inheritdoc */
  async listByUser(query: PaymentListQuery): Promise<Payment[]> {
    const rows = await this.prisma.payment.findMany({
      where: {
        userId: query.userId,
        ...(query.cursor
          ? {
              OR: [
                { createdAt: { lt: query.cursor.createdAt } },
                {
                  createdAt: query.cursor.createdAt,
                  id: { lt: query.cursor.id },
                },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: query.limit,
    });
    return rows.map((row) => PaymentMapper.toDomain(row));
  }

  /** @inheritdoc */
  async save(payment: Payment): Promise<void> {
    try {
      await this.prisma.payment.create({
        data: PaymentMapper.toCreateInput(payment),
      });
    } catch (error) {
      if (isPaymentIdempotencyUniqueViolation(error)) {
        throw new IdempotencyRaceError();
      }
      throw error;
    }
  }

  /** @inheritdoc */
  async update(payment: Payment): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.payment.findUniqueOrThrow({
        where: { id: payment.id },
      });

      await tx.payment.update({
        where: { id: payment.id },
        data: PaymentMapper.toUpdateInput(payment),
      });

      if (existing.status !== payment.status) {
        await tx.paymentAuditLog.create({
          data: {
            paymentId: payment.id,
            fromStatus: existing.status,
            toStatus: payment.status,
            reason: payment.processorMessage,
          },
        });
      }
    });
  }
}
