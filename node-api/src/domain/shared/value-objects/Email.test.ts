import { Email, InvalidEmailError } from './Email';

describe('Email', () => {
  it('creates a valid email', () => {
    const email = Email.create('User@Example.COM');
    expect(email).toBe('user@example.com');
  });

  it('throws InvalidEmailError for malformed addresses', () => {
    expect(() => Email.create('no-at')).toThrow(InvalidEmailError);
    expect(() => Email.create('')).toThrow(InvalidEmailError);
  });
});
