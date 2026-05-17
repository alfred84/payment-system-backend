import { randomUUID } from 'node:crypto';

/**
 * Build a unique user creation payload.
 *
 * @returns User body fields.
 */
export function buildUserPayload() {
  const suffix = randomUUID();
  return {
    fullName: 'Test User',
    email: `user-${suffix}@example.com`,
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
