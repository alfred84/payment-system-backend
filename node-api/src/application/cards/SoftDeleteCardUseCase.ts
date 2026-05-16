import { CardNotFoundError } from '../../domain/card/errors';
import type { CardRepository } from '../../domain/card/CardRepository';
import type { SoftDeleteCardInput } from '../dto/card.dto';

/**
 * Soft-delete a card owned by the user.
 */
export class SoftDeleteCardUseCase {
  constructor(private readonly cardRepository: CardRepository) {}

  /**
   * Deactivate a card when it belongs to the user.
   *
   * @param input - Owner user id and card id.
   * @throws {CardNotFoundError} When the card is missing or not owned.
   *
   * @example
   *   await softDeleteCard.execute({
   *     userId: '11111111-1111-4111-8111-111111111111',
   *     cardId: '22222222-2222-4222-8222-222222222222',
   *   });
   */
  async execute(input: SoftDeleteCardInput): Promise<void> {
    const card = await this.cardRepository.findById(input.cardId, input.userId);
    if (!card) {
      throw new CardNotFoundError();
    }

    if (!card.isActive) {
      return;
    }

    await this.cardRepository.save(card.deactivate());
  }
}
