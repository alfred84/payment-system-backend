import { DomainError } from '../DomainError';

/** Branded type for validated email addresses. */
export type Email = string & { readonly __brand: 'Email' };

/** Thrown when an email address fails format validation. */
export class InvalidEmailError extends DomainError {
  constructor(value: string) {
    super(`Invalid email address: ${value}`, 'INVALID_EMAIL');
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Factory for validated {@link Email} value objects.
 */
export const Email = {
  /**
   * Create an email value object (trimmed and lowercased).
   *
   * @param value - Raw email string from input.
   * @returns Branded email value.
   * @throws {InvalidEmailError} When the format is invalid.
   */
  create(value: string): Email {
    const normalized = value.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalized)) {
      throw new InvalidEmailError(value);
    }
    return normalized as Email;
  },
};
