import type { PrismaClient } from '@prisma/client';

import type { RefreshToken } from '../../domain/auth/RefreshToken';
import type { RefreshTokenRepository } from '../../domain/auth/RefreshTokenRepository';
import { RefreshTokenMapper } from './mappers/RefreshTokenMapper';

/**
 * Prisma implementation of {@link RefreshTokenRepository}.
 */
export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /** @inheritdoc */
  async findById(id: string): Promise<RefreshToken | null> {
    const row = await this.prisma.refreshToken.findUnique({ where: { id } });
    return row ? RefreshTokenMapper.toDomain(row) : null;
  }

  /** @inheritdoc */
  async findActiveByUserId(userId: string): Promise<RefreshToken[]> {
    const rows = await this.prisma.refreshToken.findMany({
      where: { userId, revoked: false },
    });
    return rows.map((row) => RefreshTokenMapper.toDomain(row));
  }

  /** @inheritdoc */
  async findAllByUserId(userId: string): Promise<RefreshToken[]> {
    const rows = await this.prisma.refreshToken.findMany({
      where: { userId },
    });
    return rows.map((row) => RefreshTokenMapper.toDomain(row));
  }

  /** @inheritdoc */
  async save(token: RefreshToken): Promise<void> {
    const data = RefreshTokenMapper.toPersistence(token);
    await this.prisma.refreshToken.create({ data });
  }

  /** @inheritdoc */
  async update(token: RefreshToken): Promise<void> {
    const data = RefreshTokenMapper.toPersistence(token);
    await this.prisma.refreshToken.update({
      where: { id: token.id },
      data: {
        revoked: data.revoked,
        replacedById: data.replacedById,
        revokedAt: data.revokedAt,
      },
    });
  }
}
