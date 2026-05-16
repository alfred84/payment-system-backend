import { DomainError } from '../DomainError';

/** Opaque processor token — never a raw PAN. */
export type CardToken = string & { readonly __brand: 'CardToken' };

/** Thrown when a card token is empty or invalid. */
export class InvalidCardTokenError extends DomainError {
  constructor() {
    super('Card token must be a non-empty opaque string', 'INVALID_CARD_TOKEN');
  }
}

/**
 * Factory for validated {@link CardToken} value objects.
 */
export const CardToken = {
  /**
   * Create a card token value object.
   *
   * @param value - Opaque token from the payment processor.
   * @returns Branded card token.
   * @throws {InvalidCardTokenError} When empty.
   */
  create(value: string): CardToken {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      throw new InvalidCardTokenError();
    }
    return trimmed as CardToken;
  },
};
