import { randomUUID } from 'node:crypto';

const STRONG_PASSWORD = 'Str0ng!Passw0rd';

export interface RegisteredUser {
  email: string;
  password: string;
  fullName: string;
  accessToken: string;
  refreshToken: string;
  userId: string;
}

/**
 * Build a unique registration payload.
 *
 * @returns Registration body fields.
 */
export function buildRegisterPayload() {
  const suffix = randomUUID();
  return {
    fullName: 'Test User',
    email: `user-${suffix}@example.com`,
    password: STRONG_PASSWORD,
  };
}

/**
 * Default valid card payload (Visa test PAN).
 */
export function buildCardPayload() {
  return {
    cardholderName: 'Test User',
    cardNumber: '4242424242424242',
    expiryMonth: 12,
    expiryYear: 2030,
    cvv: '123',
  };
}

export { STRONG_PASSWORD };
