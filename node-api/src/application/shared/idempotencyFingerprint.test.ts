import {
  buildPaymentFingerprint,
  readStoredFingerprint,
  withPaymentFingerprint,
} from './idempotencyFingerprint';
import { IDEMPOTENCY_FINGERPRINT_METADATA_KEY } from './constants';

describe('idempotencyFingerprint', () => {
  it('builds a stable fingerprint for the same payload', () => {
    const a = buildPaymentFingerprint({
      cardId: '22222222-2222-4222-8222-222222222222',
      amount: 19.99,
      currency: 'usd',
    });
    const b = buildPaymentFingerprint({
      cardId: '22222222-2222-4222-8222-222222222222',
      amount: 19.99,
      currency: 'USD',
    });
    expect(a).toBe(b);
  });

  it('stores and reads the fingerprint from metadata', () => {
    const metadata = withPaymentFingerprint({}, 'abc123');
    expect(metadata[IDEMPOTENCY_FINGERPRINT_METADATA_KEY]).toBe('abc123');
    expect(readStoredFingerprint(metadata)).toBe('abc123');
  });

  it('returns undefined when metadata has no fingerprint', () => {
    expect(readStoredFingerprint({ other: 1 })).toBeUndefined();
    expect(readStoredFingerprint({ [IDEMPOTENCY_FINGERPRINT_METADATA_KEY]: 42 })).toBeUndefined();
  });
});
