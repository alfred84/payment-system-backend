import { RefreshToken } from '../../domain/auth/RefreshToken';
import type { RefreshTokenRepository } from '../../domain/auth/RefreshTokenRepository';
import { Email } from '../../domain/shared/value-objects/Email';
import { User } from '../../domain/user/User';
import type { UserRepository } from '../../domain/user/UserRepository';
import type { Clock } from '../ports/Clock';
import type { PasswordHasher } from '../ports/PasswordHasher';
import type { TokenSigner } from '../ports/TokenSigner';
import type { UuidGenerator } from '../ports/UuidGenerator';
import { AuthenticateUserUseCase } from './AuthenticateUserUseCase';
import { InvalidCredentialsError } from './errors';

describe('AuthenticateUserUseCase', () => {
  const now = new Date('2026-05-16T12:00:00.000Z');
  const userId = '11111111-1111-4111-8111-111111111111';
  const refreshId = '22222222-2222-4222-8222-222222222222';

  const user = User.restore({
    id: userId,
    fullName: 'Ada Lovelace',
    email: Email.create('ada@example.com'),
    passwordHash: '$2b$12$userhash',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  const userRepository: jest.Mocked<UserRepository> = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
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
    hash: jest.fn().mockResolvedValue('$2b$12$refreshhash'),
    compare: jest.fn(),
    getDummyHash: jest.fn().mockReturnValue('$2b$12$dummy'),
  };

  const tokenSigner: jest.Mocked<TokenSigner> = {
    signAccessToken: jest.fn().mockReturnValue('access.jwt.token'),
    getAccessTokenExpiresInSeconds: jest.fn().mockReturnValue(900),
  };

  const clock: jest.Mocked<Clock> = {
    now: jest.fn().mockReturnValue(now),
  };

  const uuidGenerator: jest.Mocked<UuidGenerator> = {
    generate: jest.fn().mockReturnValue(refreshId),
  };

  const useCase = new AuthenticateUserUseCase(
    userRepository,
    refreshTokenRepository,
    passwordHasher,
    tokenSigner,
    clock,
    uuidGenerator,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository.findByEmail.mockResolvedValue(user);
    passwordHasher.compare.mockResolvedValue(true);
  });

  it('returns access and refresh tokens on success', async () => {
    const result = await useCase.execute({
      email: 'ada@example.com',
      password: 'correct horse battery staple',
    });

    expect(tokenSigner.signAccessToken).toHaveBeenCalledWith({
      sub: userId,
      email: 'ada@example.com',
    });
    expect(refreshTokenRepository.save).toHaveBeenCalledWith(expect.any(RefreshToken));
    expect(result).toEqual({
      accessToken: 'access.jwt.token',
      refreshToken: `${userId}.${refreshId}`,
      expiresIn: 900,
    });
  });

  it('throws InvalidCredentialsError on wrong password', async () => {
    passwordHasher.compare.mockResolvedValue(false);

    await expect(useCase.execute({ email: 'ada@example.com', password: 'wrong' })).rejects.toThrow(
      InvalidCredentialsError,
    );
    expect(refreshTokenRepository.save).not.toHaveBeenCalled();
  });

  it('compares against dummy hash when user is missing', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    passwordHasher.compare.mockResolvedValue(false);

    await expect(
      useCase.execute({ email: 'missing@example.com', password: 'secret' }),
    ).rejects.toThrow(InvalidCredentialsError);

    expect(passwordHasher.compare).toHaveBeenCalledWith('secret', '$2b$12$dummy');
  });
});
