import { RefreshToken } from '../../domain/auth/RefreshToken';
import { Email } from '../../domain/shared/value-objects/Email';
import { User } from '../../domain/user/User';
import { prisma } from '../../../test/setup.integration';
import { PrismaRefreshTokenRepository } from './PrismaRefreshTokenRepository';
import { PrismaUserRepository } from './PrismaUserRepository';

describe('PrismaRefreshTokenRepository (integration)', () => {
  const userRepository = new PrismaUserRepository(prisma);
  const tokenRepository = new PrismaRefreshTokenRepository(prisma);
  const now = new Date('2026-05-16T12:00:00.000Z');
  const userId = '11111111-1111-4111-8111-111111111111';

  beforeEach(async () => {
    await userRepository.save(
      User.register({
        id: userId,
        fullName: 'Ada Lovelace',
        email: Email.create('ada@example.com'),
        passwordHash: '$2b$12$hashed',
        now,
      }),
    );
  });

  it('persists rotation chain via replaced_by', async () => {
    const oldToken = RefreshToken.create({
      id: '22222222-2222-4222-8222-222222222222',
      userId,
      tokenHash: '$2b$12$old',
      expiresAt: new Date('2026-05-23T12:00:00.000Z'),
      createdAt: now,
    });
    await tokenRepository.save(oldToken);

    const newTokenId = '33333333-3333-4333-8333-333333333333';
    const replacement = RefreshToken.create({
      id: newTokenId,
      userId,
      tokenHash: '$2b$12$new',
      expiresAt: new Date('2026-05-23T12:00:00.000Z'),
      createdAt: now,
    });
    await tokenRepository.save(replacement);

    const rotated = oldToken.markReplacedBy(newTokenId, now);
    await tokenRepository.update(rotated);

    const row = await prisma.refreshToken.findUnique({
      where: { id: oldToken.id },
    });
    expect(row?.revoked).toBe(true);
    expect(row?.replacedById).toBe(newTokenId);

    const active = await tokenRepository.findActiveByUserId(userId);
    expect(active).toHaveLength(1);
    expect(active[0]?.id).toBe(newTokenId);

    const byId = await tokenRepository.findById(oldToken.id);
    expect(byId?.revoked).toBe(true);
  });
});
