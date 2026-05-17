import { Email } from '../shared/value-objects/Email';
import { User } from './User';

describe('User', () => {
  const now = new Date('2026-01-01T00:00:00.000Z');

  it('creates a user with email value object', () => {
    const user = User.create({
      id: '11111111-1111-4111-8111-111111111111',
      fullName: 'Ada Lovelace',
      email: Email.create('ada@example.com'),
      now,
    });

    expect(user.fullName).toBe('Ada Lovelace');
    expect(user.email).toBe('ada@example.com');
    expect(user.createdAt).toEqual(now);
    expect(user).not.toHaveProperty('passwordHash');
    expect(user).not.toHaveProperty('password');
  });

  it('trims whitespace from fullName on creation', () => {
    const user = User.create({
      id: '11111111-1111-4111-8111-111111111111',
      fullName: '  Ada Lovelace  ',
      email: Email.create('ada@example.com'),
      now,
    });

    expect(user.fullName).toBe('Ada Lovelace');
  });

  it('restores a persisted user', () => {
    const user = User.restore({
      id: '11111111-1111-4111-8111-111111111111',
      fullName: 'Ada Lovelace',
      email: Email.create('ada@example.com'),
      createdAt: now,
      updatedAt: now,
    });

    expect(user.id).toBe('11111111-1111-4111-8111-111111111111');
  });
});
