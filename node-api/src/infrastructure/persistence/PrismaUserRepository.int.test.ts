import { Email } from '../../domain/shared/value-objects/Email';
import { User } from '../../domain/user/User';
import { prisma } from '../../../test/setup.integration';
import { UserMapper } from './mappers/UserMapper';
import { PrismaUserRepository } from './PrismaUserRepository';

describe('PrismaUserRepository (integration)', () => {
  const repository = new PrismaUserRepository(prisma);
  const now = new Date('2026-05-16T12:00:00.000Z');

  it('returns null when the user does not exist', async () => {
    const found = await repository.findByEmail(Email.create('missing@example.com'));
    expect(found).toBeNull();
    expect(await repository.findById('99999999-9999-4999-8999-999999999999')).toBeNull();
  });

  it('persists and retrieves a user by email', async () => {
    const user = User.register({
      id: '11111111-1111-4111-8111-111111111111',
      fullName: 'Ada Lovelace',
      email: Email.create('ada@example.com'),
      passwordHash: '$2b$12$hashed',
      now,
    });

    await repository.save(user);

    const found = await repository.findByEmail(Email.create('ada@example.com'));
    expect(found?.id).toBe(user.id);
    expect(found?.fullName).toBe('Ada Lovelace');

    const byId = await repository.findById(user.id);
    expect(byId?.email).toBe('ada@example.com');
  });

  it('enforces unique email at the database level', async () => {
    const email = Email.create('race@example.com');
    const first = User.register({
      id: '11111111-1111-4111-8111-111111111111',
      fullName: 'First',
      email,
      passwordHash: '$2b$12$first',
      now,
    });
    const second = User.register({
      id: '22222222-2222-4222-8222-222222222222',
      fullName: 'Second',
      email,
      passwordHash: '$2b$12$second',
      now,
    });

    const results = await Promise.allSettled([
      prisma.user.create({ data: UserMapper.toPersistence(first) }),
      prisma.user.create({ data: UserMapper.toPersistence(second) }),
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
  });
});
