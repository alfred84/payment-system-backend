import { RefreshToken } from '../../domain/auth/RefreshToken';
import type { RefreshTokenRepository } from '../../domain/auth/RefreshTokenRepository';
import type { Clock } from '../ports/Clock';
import type { PasswordHasher } from '../ports/PasswordHasher';
import { formatRefreshToken } from './refreshTokenFormat';
import { LogoutUseCase } from './LogoutUseCase';

describe('LogoutUseCase', () => {
  const now = new Date('2026-05-16T12:00:00.000Z');
  const userId = '11111111-1111-4111-8111-111111111111';
  const tokenId = '22222222-2222-4222-8222-222222222222';
  const plain = formatRefreshToken(userId, tokenId);

  const activeToken = RefreshToken.restore({
    id: tokenId,
    userId,
    tokenHash: '$2b$12$hash',
    expiresAt: new Date('2026-05-23T12:00:00.000Z'),
    revoked: false,
    replacedById: null,
    createdAt: now,
    revokedAt: null,
  });

  const refreshTokenRepository: jest.Mocked<RefreshTokenRepository> = {
    findById: jest.fn(),
    findActiveByUserId: jest.fn(),
    findAllByUserId: jest.fn().mockResolvedValue([activeToken]),
    save: jest.fn(),
    update: jest.fn(),
  };

  const passwordHasher: jest.Mocked<PasswordHasher> = {
    hash: jest.fn(),
    compare: jest.fn().mockImplementation(async (value, hash) => {
      return value === plain && hash === '$2b$12$hash';
    }),
    getDummyHash: jest.fn(),
  };

  const clock: jest.Mocked<Clock> = {
    now: jest.fn().mockReturnValue(now),
  };

  const useCase = new LogoutUseCase(refreshTokenRepository, passwordHasher, clock);

  beforeEach(() => {
    jest.clearAllMocks();
    refreshTokenRepository.findAllByUserId.mockResolvedValue([activeToken]);
  });

  it('revokes a matching refresh token', async () => {
    await useCase.execute({ refreshToken: plain });

    expect(refreshTokenRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({ revoked: true }),
    );
  });

  it('is idempotent when logging out twice', async () => {
    await useCase.execute({ refreshToken: plain });

    const revoked = activeToken.revoke(now);
    refreshTokenRepository.findAllByUserId.mockResolvedValue([revoked]);

    await useCase.execute({ refreshToken: plain });

    expect(refreshTokenRepository.update).toHaveBeenCalledTimes(1);
  });

  it('does nothing when the token format is invalid', async () => {
    await useCase.execute({ refreshToken: 'invalid' });
    expect(refreshTokenRepository.findAllByUserId).not.toHaveBeenCalled();
  });

  it('does nothing for an unknown token', async () => {
    passwordHasher.compare.mockResolvedValue(false);

    await useCase.execute({ refreshToken: plain });

    expect(refreshTokenRepository.update).not.toHaveBeenCalled();
  });
});
