import { RefreshToken } from '../../domain/auth/RefreshToken';
import type { RefreshTokenRepository } from '../../domain/auth/RefreshTokenRepository';
import { Email } from '../../domain/shared/value-objects/Email';
import { User } from '../../domain/user/User';
import type { UserRepository } from '../../domain/user/UserRepository';
import type { Clock } from '../ports/Clock';
import type { PasswordHasher } from '../ports/PasswordHasher';
import type { TokenSigner } from '../ports/TokenSigner';
import type { UuidGenerator } from '../ports/UuidGenerator';
import { formatRefreshToken } from './refreshTokenFormat';
import { RefreshAccessTokenUseCase } from './RefreshAccessTokenUseCase';
import { InvalidRefreshTokenError, RefreshTokenReuseError } from './errors';

describe('RefreshAccessTokenUseCase', () => {
  const now = new Date('2026-05-16T12:00:00.000Z');
  const userId = '11111111-1111-4111-8111-111111111111';
  const oldTokenId = '22222222-2222-4222-8222-222222222222';
  const newTokenId = '33333333-3333-4333-8333-333333333333';
  const plainOld = formatRefreshToken(userId, oldTokenId);

  const user = User.restore({
    id: userId,
    fullName: 'Ada Lovelace',
    email: Email.create('ada@example.com'),
    passwordHash: '$2b$12$userhash',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  const activeToken = RefreshToken.restore({
    id: oldTokenId,
    userId,
    tokenHash: '$2b$12$oldhash',
    expiresAt: new Date('2026-05-23T12:00:00.000Z'),
    revoked: false,
    replacedById: null,
    createdAt: now,
    revokedAt: null,
  });

  const userRepository: jest.Mocked<UserRepository> = {
    findByEmail: jest.fn(),
    findById: jest.fn().mockResolvedValue(user),
    save: jest.fn(),
  };

  const refreshTokenRepository: jest.Mocked<RefreshTokenRepository> = {
    findById: jest.fn(),
    findActiveByUserId: jest.fn(),
    findAllByUserId: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const passwordHasher: jest.Mocked<PasswordHasher> = {
    hash: jest.fn().mockResolvedValue('$2b$12$newhash'),
    compare: jest.fn(),
    getDummyHash: jest.fn(),
  };

  const tokenSigner: jest.Mocked<TokenSigner> = {
    signAccessToken: jest.fn().mockReturnValue('new.access.token'),
    getAccessTokenExpiresInSeconds: jest.fn().mockReturnValue(900),
  };

  const clock: jest.Mocked<Clock> = {
    now: jest.fn().mockReturnValue(now),
  };

  const uuidGenerator: jest.Mocked<UuidGenerator> = {
    generate: jest.fn().mockReturnValue(newTokenId),
  };

  const useCase = new RefreshAccessTokenUseCase(
    userRepository,
    refreshTokenRepository,
    passwordHasher,
    tokenSigner,
    clock,
    uuidGenerator,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    refreshTokenRepository.findAllByUserId.mockResolvedValue([activeToken]);
    passwordHasher.compare.mockImplementation(async (plain, hash) => {
      return plain === plainOld && hash === '$2b$12$oldhash';
    });
  });

  it('rotates a valid refresh token', async () => {
    const result = await useCase.execute({ refreshToken: plainOld });

    expect(refreshTokenRepository.update).toHaveBeenCalled();
    expect(refreshTokenRepository.save).toHaveBeenCalled();
    expect(result.accessToken).toBe('new.access.token');
    expect(result.refreshToken).toBe(formatRefreshToken(userId, newTokenId));
  });

  it('revokes the family when a revoked token is reused', async () => {
    const otherActive = RefreshToken.restore({
      id: '44444444-4444-4444-8444-444444444444',
      userId,
      tokenHash: '$2b$12$other',
      expiresAt: new Date('2026-05-23T12:00:00.000Z'),
      revoked: false,
      replacedById: null,
      createdAt: now,
      revokedAt: null,
    });
    const revokedToken = activeToken.revoke(now);

    refreshTokenRepository.findAllByUserId.mockResolvedValue([revokedToken]);
    refreshTokenRepository.findActiveByUserId.mockResolvedValue([otherActive]);
    passwordHasher.compare.mockImplementation(async (plain, hash) => {
      return plain === plainOld && hash === '$2b$12$oldhash';
    });

    await expect(useCase.execute({ refreshToken: plainOld })).rejects.toThrow(
      RefreshTokenReuseError,
    );
    expect(refreshTokenRepository.update).toHaveBeenCalled();
  });

  it('throws when the refresh token is unknown', async () => {
    passwordHasher.compare.mockResolvedValue(false);

    await expect(useCase.execute({ refreshToken: plainOld })).rejects.toThrow(
      InvalidRefreshTokenError,
    );
  });

  it('throws when the refresh token is expired', async () => {
    const expired = RefreshToken.restore({
      id: oldTokenId,
      userId,
      tokenHash: '$2b$12$oldhash',
      expiresAt: new Date('2026-05-01T12:00:00.000Z'),
      revoked: false,
      replacedById: null,
      createdAt: now,
      revokedAt: null,
    });
    refreshTokenRepository.findAllByUserId.mockResolvedValue([expired]);

    await expect(useCase.execute({ refreshToken: plainOld })).rejects.toThrow(
      InvalidRefreshTokenError,
    );
  });

  it('throws when the refresh token format is invalid', async () => {
    await expect(useCase.execute({ refreshToken: 'not-a-valid-token' })).rejects.toThrow(
      InvalidRefreshTokenError,
    );
  });
});
