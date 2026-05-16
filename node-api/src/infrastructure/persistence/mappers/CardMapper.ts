import type { Card as PrismaCard } from '@prisma/client';

import { Card } from '../../../domain/card/Card';
import { CardToken } from '../../../domain/shared/value-objects/CardToken';

/**
 * Maps between Prisma card rows and domain {@link Card} entities.
 */
export const CardMapper = {
  /**
   * Convert a persistence row to a domain entity.
   *
   * @param row - Prisma card record.
   * @returns Domain card.
   */
  toDomain(row: PrismaCard): Card {
    return Card.restore({
      id: row.id,
      userId: row.userId,
      cardholderName: row.cardholderName,
      lastFourDigits: row.lastFourDigits,
      brand: row.brand,
      expiryMonth: row.expiryMonth,
      expiryYear: row.expiryYear,
      token: CardToken.create(row.token),
      isActive: row.isActive,
      createdAt: row.createdAt,
    });
  },

  /**
   * Convert a domain entity to Prisma create/update input.
   *
   * @param card - Domain card.
   * @returns Prisma card write shape.
   */
  toPersistence(card: Card): PrismaCard {
    return {
      id: card.id,
      userId: card.userId,
      cardholderName: card.cardholderName,
      lastFourDigits: card.lastFourDigits,
      brand: card.brand,
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      token: card.token,
      isActive: card.isActive,
      createdAt: card.createdAt,
    };
  },
};
