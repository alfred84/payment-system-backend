import type { Card } from '../../domain/card/Card';
import type { CardSummaryOutput } from '../dto/card.dto';

/**
 * Map a domain card to an API-safe summary (no token).
 *
 * @param card - Domain card entity.
 * @returns Card summary DTO.
 */
export function toCardSummary(card: Card): CardSummaryOutput {
  return {
    id: card.id,
    cardholderName: card.cardholderName,
    lastFourDigits: card.lastFourDigits,
    brand: card.brand,
    expiryMonth: card.expiryMonth,
    expiryYear: card.expiryYear,
    maskedPan: card.mask(),
    createdAt: card.createdAt,
  };
}
