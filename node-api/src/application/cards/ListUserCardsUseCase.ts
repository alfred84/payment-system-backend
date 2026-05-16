import type { CardRepository } from '../../domain/card/CardRepository';
import type { CardSummaryOutput, ListUserCardsInput } from '../dto/card.dto';
import { toCardSummary } from './cardMapper';

/**
 * List active cards for the authenticated user.
 */
export class ListUserCardsUseCase {
  constructor(private readonly cardRepository: CardRepository) {}

  /**
   * Return active cards owned by the user.
   *
   * @param input - List query with owner user id.
   * @returns Card summaries (no tokens).
   *
   * @example
   *   const cards = await listUserCards.execute({
   *     userId: '11111111-1111-4111-8111-111111111111',
   *   });
   */
  async execute(input: ListUserCardsInput): Promise<CardSummaryOutput[]> {
    const cards = await this.cardRepository.findActiveByUserId(input.userId);
    return cards.map(toCardSummary);
  }
}
