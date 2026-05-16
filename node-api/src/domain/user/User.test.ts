import { Email } from '../shared/value-objects/Email';
import { User } from './User';

describe('User', () => {
  const now = new Date('2026-01-01T00:00:00.000Z');

  it('registers an active user with email value object and password hash only', () => {
    const user = User.register({
      id: '11111111-1111-4111-8111-111111111111',
      fullName: 'Ada Lovelace',
      email: Email.create('ada@example.com'),
      passwordHash: '$2b$12$hashedpasswordvalue',
      now,
    });

    expect(user.isActive).toBe(true);
    expect(user.email).toBe('ada@example.com');
    expect(user.passwordHash).toBe('$2b$12$hashedpasswordvalue');
    expect(user).not.toHaveProperty('password');
    expect(user).not.toHaveProperty('plainPassword');
  });

  it('restores a persisted user', () => {
    const user = User.restore({
      id: '11111111-1111-4111-8111-111111111111',
      fullName: 'Ada Lovelace',
      email: Email.create('ada@example.com'),
      passwordHash: '$2b$12$hashedpasswordvalue',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    expect(user.id).toBe('11111111-1111-4111-8111-111111111111');
  });
});
