import type { Card } from './Card';

/**
 * Persistence port for {@link Card} aggregates.
 */
export interface CardRepository {
  /**
   * Find a card by id scoped to a user.
   *
   * @param id - Card UUID.
   * @param userId - Owner user UUID.
   * @returns Card if found and owned, otherwise null.
   */
  findById(id: string, userId: string): Promise<Card | null>;

  /**
   * List active cards for a user.
   *
   * @param userId - Owner user UUID.
   * @returns Active cards ordered by creation date descending.
   */
  findActiveByUserId(userId: string): Promise<Card[]>;

  /**
   * Persist a new or updated card.
   *
   * @param card - Card entity.
   */
  save(card: Card): Promise<void>;
}
