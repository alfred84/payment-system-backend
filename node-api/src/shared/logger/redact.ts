const SENSITIVE_KEYS = new Set([
  'token',
  'cvv',
  'cardNumber',
  'pan',
  'idempotencyKey',
]);

/**
 * Recursively redact sensitive fields from log payloads.
 *
 * @param value - Value to redact (object, array, or primitive).
 * @returns Redacted copy safe for logging.
 */
export function redact(value: unknown): unknown {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(redact);
  }
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    out[key] = SENSITIVE_KEYS.has(key) ? '[REDACTED]' : redact(val);
  }
  return out;
}
