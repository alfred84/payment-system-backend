import { Email } from '../../domain/shared/value-objects/Email';
import { User } from '../../domain/user/User';
import { EmailAlreadyInUseError } from '../../domain/user/errors';
import type { UserRepository } from '../../domain/user/UserRepository';
import type { Clock } from '../ports/Clock';
import type { UuidGenerator } from '../ports/UuidGenerator';
import { CreateUserUseCase } from './CreateUserUseCase';

describe('CreateUserUseCase', () => {
  const now = new Date('2026-05-16T12:00:00.000Z');
  const userId = '11111111-1111-4111-8111-111111111111';

  const userRepository: jest.Mocked<UserRepository> = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    save: jest.fn(),
  };

  const clock: jest.Mocked<Clock> = {
    now: jest.fn().mockReturnValue(now),
  };

  const uuidGenerator: jest.Mocked<UuidGenerator> = {
    generate: jest.fn().mockReturnValue(userId),
  };

  const useCase = new CreateUserUseCase(userRepository, clock, uuidGenerator);

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository.findByEmail.mockResolvedValue(null);
  });

  it('saves and returns a new user', async () => {
    const result = await useCase.execute({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
    });

    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: userId,
        fullName: 'Ada Lovelace',
        email: Email.create('ada@example.com'),
      }),
    );
    expect(result).toMatchObject({
      id: userId,
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      createdAt: now,
    });
  });

  it('throws EmailAlreadyInUseError when email is taken', async () => {
    userRepository.findByEmail.mockResolvedValue(
      User.restore({
        id: userId,
        fullName: 'Existing',
        email: Email.create('ada@example.com'),
        createdAt: now,
        updatedAt: now,
      }),
    );

    await expect(
      useCase.execute({ fullName: 'Ada Lovelace', email: 'ada@example.com' }),
    ).rejects.toThrow(EmailAlreadyInUseError);
    expect(userRepository.save).not.toHaveBeenCalled();
  });
});
