import { User } from '../../domain/user/User';
import { Email } from '../../domain/shared/value-objects/Email';
import type { UserRepository } from '../../domain/user/UserRepository';
import { ListUsersUseCase } from './ListUsersUseCase';

describe('ListUsersUseCase', () => {
  const now = new Date('2026-05-16T12:00:00.000Z');

  const user = User.restore({
    id: '11111111-1111-4111-8111-111111111111',
    fullName: 'Ada Lovelace',
    email: Email.create('ada@example.com'),
    createdAt: now,
    updatedAt: now,
  });

  const userRepository: jest.Mocked<UserRepository> = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn().mockResolvedValue([user]),
    save: jest.fn(),
  };

  const useCase = new ListUsersUseCase(userRepository);

  it('returns all users mapped to output DTOs', async () => {
    const result = await useCase.execute();

    expect(userRepository.findAll).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: user.id,
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
    });
  });
});
