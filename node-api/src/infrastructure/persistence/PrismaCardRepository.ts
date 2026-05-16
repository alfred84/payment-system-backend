import type { PrismaClient } from '@prisma/client';

import type { Card } from '../../domain/card/Card';
import type { CardRepository } from '../../domain/card/CardRepository';
import { CardMapper } from './mappers/CardMapper';

/**
 * Prisma implementation of {@link CardRepository}.
 */
export class PrismaCardRepository implements CardRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /** @inheritdoc */
  async findById(id: string, userId: string): Promise<Card | null> {
    const row = await this.prisma.card.findFirst({
      where: { id, userId },
    });
    return row ? CardMapper.toDomain(row) : null;
  }

  /** @inheritdoc */
  async findActiveByUserId(userId: string): Promise<Card[]> {
    const rows = await this.prisma.card.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => CardMapper.toDomain(row));
  }

  /** @inheritdoc */
  async save(card: Card): Promise<void> {
    const data = CardMapper.toPersistence(card);
    await this.prisma.card.upsert({
      where: { id: card.id },
      create: data,
      update: {
        cardholderName: data.cardholderName,
        lastFourDigits: data.lastFourDigits,
        brand: data.brand,
        expiryMonth: data.expiryMonth,
        expiryYear: data.expiryYear,
        token: data.token,
        isActive: data.isActive,
      },
    });
  }
}
