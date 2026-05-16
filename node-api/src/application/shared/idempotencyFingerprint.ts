import { createHash } from 'node:crypto';

import { IDEMPOTENCY_FINGERPRINT_METADATA_KEY } from './constants';

export interface PaymentFingerprintInput {
  cardId: string;
  amount: number;
  currency: string;
  description?: string | undefined;
}

/**
 * Build a stable SHA-256 fingerprint for idempotency conflict detection.
 *
 * @param input - Normalized payment body fields.
 * @returns Hex-encoded fingerprint.
 */
export function buildPaymentFingerprint(input: PaymentFingerprintInput): string {
  const normalized = {
    amount: input.amount,
    cardId: input.cardId,
    currency: input.currency.toUpperCase(),
    description: input.description ?? null,
  };
  return createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
}

/**
 * Read a stored fingerprint from payment metadata.
 *
 * @param metadata - Payment metadata object.
 * @returns Fingerprint or undefined.
 */
export function readStoredFingerprint(metadata: Record<string, unknown>): string | undefined {
  const value = metadata[IDEMPOTENCY_FINGERPRINT_METADATA_KEY];
  return typeof value === 'string' ? value : undefined;
}

/**
 * Attach the fingerprint to payment metadata.
 *
 * @param metadata - Existing metadata.
 * @param fingerprint - Request fingerprint.
 * @returns Metadata including the fingerprint key.
 */
export function withPaymentFingerprint(
  metadata: Record<string, unknown>,
  fingerprint: string,
): Record<string, unknown> {
  return { ...metadata, [IDEMPOTENCY_FINGERPRINT_METADATA_KEY]: fingerprint };
}
