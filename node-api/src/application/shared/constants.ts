/** Idempotency deduplication window (24 hours). */
export const IDEMPOTENCY_WINDOW_MS = 24 * 60 * 60 * 1000;

/** Metadata key for the idempotency request fingerprint. */
export const IDEMPOTENCY_FINGERPRINT_METADATA_KEY = 'idempotencyFingerprint';
