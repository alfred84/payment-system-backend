import { validate as uuidValidate, version as uuidVersion } from 'uuid';

import { DomainError } from '../DomainError';

/** Branded UUID v4 idempotency key. */
export type IdempotencyKey = string & { readonly __brand: 'IdempotencyKey' };

/** Thrown when an idempotency key is not a valid UUID v4. */
export class InvalidIdempotencyKeyError extends DomainError {
  constructor(value: string) {
    super(`Invalid idempotency key (UUID v4 required): ${value}`, 'INVALID_IDEMPOTENCY_KEY');
  }
}

/**
 * Factory for validated {@link IdempotencyKey} value objects.
 */
export const IdempotencyKey = {
  /**
   * Create an idempotency key from a client-supplied UUID v4.
   *
   * @param value - Raw idempotency key string.
   * @returns Branded idempotency key.
   * @throws {InvalidIdempotencyKeyError} When not a UUID v4.
   */
  create(value: string): IdempotencyKey {
    const trimmed = value.trim();
    if (!uuidValidate(trimmed) || uuidVersion(trimmed) !== 4) {
      throw new InvalidIdempotencyKeyError(value);
    }
    return trimmed as IdempotencyKey;
  },
};
