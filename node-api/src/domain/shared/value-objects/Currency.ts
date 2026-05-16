import { DomainError } from '../DomainError';

/** Branded ISO 4217 currency code (uppercase). */
export type Currency = string & { readonly __brand: 'Currency' };

const ISO_4217 = new Set([
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'CAD',
  'AUD',
  'CHF',
  'MXN',
  'BRL',
  'ARS',
  'COP',
]);

/** Thrown when a currency code is not a valid ISO 4217 code. */
export class InvalidCurrencyError extends DomainError {
  constructor(value: string) {
    super(`Invalid currency code: ${value}`, 'INVALID_CURRENCY');
  }
}

/**
 * Factory for validated {@link Currency} value objects.
 */
export const Currency = {
  /**
   * Create a currency code value object.
   *
   * @param code - Three-letter ISO 4217 code.
   * @returns Uppercase branded currency code.
   * @throws {InvalidCurrencyError} When the code is unknown or malformed.
   */
  create(code: string): Currency {
    const upper = code.trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(upper) || !ISO_4217.has(upper)) {
      throw new InvalidCurrencyError(code);
    }
    return upper as Currency;
  },
};
