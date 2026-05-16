import type { RefreshToken as PrismaRefreshToken } from '@prisma/client';

import { RefreshToken } from '../../../domain/auth/RefreshToken';

/**
 * Maps between Prisma refresh-token rows and domain entities.
 */
export const RefreshTokenMapper = {
  /**
   * Convert a persistence row to a domain entity.
   *
   * @param row - Prisma refresh token record.
   * @returns Domain refresh token.
   */
  toDomain(row: PrismaRefreshToken): RefreshToken {
    return RefreshToken.restore({
      id: row.id,
      userId: row.userId,
      tokenHash: row.tokenHash,
      expiresAt: row.expiresAt,
      revoked: row.revoked,
      replacedById: row.replacedById,
      createdAt: row.createdAt,
      revokedAt: row.revokedAt,
    });
  },

  /**
   * Convert a domain entity to Prisma create/update input.
   *
   * @param token - Domain refresh token.
   * @returns Prisma refresh token write shape.
   */
  toPersistence(token: RefreshToken): PrismaRefreshToken {
    return {
      id: token.id,
      userId: token.userId,
      tokenHash: token.tokenHash,
      expiresAt: token.expiresAt,
      revoked: token.revoked,
      replacedById: token.replacedById,
      createdAt: token.createdAt,
      revokedAt: token.revokedAt,
    };
  },
};
