import { User } from '../../domain/user/User';
import { Email } from '../../domain/shared/value-objects/Email';
import { UserNotFoundError } from '../../domain/user/errors';
import type { UserRepository } from '../../domain/user/UserRepository';
import { GetUserByIdUseCase } from './GetUserByIdUseCase';

describe('GetUserByIdUseCase', () => {
  const now = new Date('2026-05-16T12:00:00.000Z');
  const userId = '11111111-1111-4111-8111-111111111111';

  const user = User.restore({
    id: userId,
    fullName: 'Ada Lovelace',
    email: Email.create('ada@example.com'),
    createdAt: now,
    updatedAt: now,
  });

  const userRepository: jest.Mocked<UserRepository> = {
    findByEmail: jest.fn(),
    findById: jest.fn().mockResolvedValue(user),
    findAll: jest.fn(),
    save: jest.fn(),
  };

  const useCase = new GetUserByIdUseCase(userRepository);

  it('returns the user when found', async () => {
    const result = await useCase.execute({ userId });

    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(result).toMatchObject({ id: userId, fullName: 'Ada Lovelace' });
  });

  it('throws UserNotFoundError when missing', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ userId })).rejects.toThrow(UserNotFoundError);
  });
});
