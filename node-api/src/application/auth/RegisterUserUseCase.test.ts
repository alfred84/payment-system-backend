import { Email } from '../../domain/shared/value-objects/Email';
import { User } from '../../domain/user/User';
import type { UserRepository } from '../../domain/user/UserRepository';
import type { Clock } from '../ports/Clock';
import type { PasswordHasher } from '../ports/PasswordHasher';
import type { UuidGenerator } from '../ports/UuidGenerator';
import { EmailAlreadyInUseError } from './errors';
import { RegisterUserUseCase } from './RegisterUserUseCase';

describe('RegisterUserUseCase', () => {
  const now = new Date('2026-05-16T12:00:00.000Z');
  const userId = '11111111-1111-4111-8111-111111111111';

  const userRepository: jest.Mocked<UserRepository> = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
  };

  const passwordHasher: jest.Mocked<PasswordHasher> = {
    hash: jest.fn().mockResolvedValue('$2b$12$hashed'),
    compare: jest.fn(),
    getDummyHash: jest.fn().mockReturnValue('$2b$12$dummy'),
  };

  const clock: jest.Mocked<Clock> = {
    now: jest.fn().mockReturnValue(now),
  };

  const uuidGenerator: jest.Mocked<UuidGenerator> = {
    generate: jest.fn().mockReturnValue(userId),
  };

  const useCase = new RegisterUserUseCase(userRepository, passwordHasher, clock, uuidGenerator);

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository.findByEmail.mockResolvedValue(null);
  });

  it('hashes the password and saves a new user', async () => {
    const result = await useCase.execute({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'correct horse battery staple',
    });

    expect(passwordHasher.hash).toHaveBeenCalledWith('correct horse battery staple');
    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: userId,
        fullName: 'Ada Lovelace',
        email: Email.create('ada@example.com'),
        passwordHash: '$2b$12$hashed',
      }),
    );
    expect(result).toEqual({
      id: userId,
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
    });
  });

  it('throws when the email is already registered', async () => {
    userRepository.findByEmail.mockResolvedValue(
      User.restore({
        id: userId,
        fullName: 'Existing',
        email: Email.create('ada@example.com'),
        passwordHash: '$2b$12$existing',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }),
    );

    await expect(
      useCase.execute({
        fullName: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'secret',
      }),
    ).rejects.toThrow(EmailAlreadyInUseError);
    expect(userRepository.save).not.toHaveBeenCalled();
  });
});
