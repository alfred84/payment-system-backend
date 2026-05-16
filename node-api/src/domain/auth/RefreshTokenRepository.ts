import type { RefreshToken } from './RefreshToken';

/**
 * Persistence port for {@link RefreshToken} records.
 */
export interface RefreshTokenRepository {
  /**
   * Find a refresh token by id.
   *
   * @param id - Token row UUID.
   * @returns Token if found, otherwise null.
   */
  findById(id: string): Promise<RefreshToken | null>;

  /**
   * List non-revoked refresh tokens for a user (for hash comparison).
   *
   * @param userId - Owner user UUID.
   * @returns Active refresh token rows.
   */
  findActiveByUserId(userId: string): Promise<RefreshToken[]>;

  /**
   * List all refresh tokens for a user (active and revoked).
   *
   * @param userId - Owner user UUID.
   * @returns All refresh token rows for reuse detection.
   */
  findAllByUserId(userId: string): Promise<RefreshToken[]>;

  /**
   * Persist a new refresh token.
   *
   * @param token - Refresh token entity.
   */
  save(token: RefreshToken): Promise<void>;

  /**
   * Update a refresh token (revocation / rotation).
   *
   * @param token - Updated token entity.
   */
  update(token: RefreshToken): Promise<void>;
}
