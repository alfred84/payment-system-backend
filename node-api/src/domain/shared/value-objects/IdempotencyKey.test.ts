import { validate as uuidValidate, version as uuidVersion } from 'uuid';

import { IdempotencyKey, InvalidIdempotencyKeyError } from './IdempotencyKey';

describe('IdempotencyKey', () => {
  it('accepts UUID v4', () => {
    const key = '8f5b3c2a-1d4e-4a9b-9c3d-2e1f0a9b8c7d';
    expect(uuidValidate(key) && uuidVersion(key) === 4).toBe(true);
    expect(IdempotencyKey.create(key)).toBe(key);
  });

  it('rejects non-v4 UUIDs', () => {
    const v1 = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
    expect(() => IdempotencyKey.create(v1)).toThrow(InvalidIdempotencyKeyError);

    const v7 = '018e8a7a-cb3e-7f2e-9a1b-2c3d4e5f6789';
    expect(() => IdempotencyKey.create(v7)).toThrow(InvalidIdempotencyKeyError);
  });
});
