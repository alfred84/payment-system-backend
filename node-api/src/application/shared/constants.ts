/** Refresh token lifetime (7 days). */
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Idempotency deduplication window (24 hours). */
export const IDEMPOTENCY_WINDOW_MS = 24 * 60 * 60 * 1000;

/** Metadata key for the idempotency request fingerprint. */
export const IDEMPOTENCY_FINGERPRINT_METADATA_KEY = 'idempotencyFingerprint';
