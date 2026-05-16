import bcrypt from 'bcrypt';

import type { PasswordHasher } from '../../application/ports/PasswordHasher';

const BCRYPT_COST = 12;

/** Precomputed dummy hash for timing-safe login on unknown users. */
const DUMMY_HASH = bcrypt.hashSync('timing-safe-dummy-password', BCRYPT_COST);

/**
 * Bcrypt implementation of {@link PasswordHasher}.
 */
export class BcryptPasswordHasher implements PasswordHasher {
  /** @inheritdoc */
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, BCRYPT_COST);
  }

  /** @inheritdoc */
  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  /** @inheritdoc */
  getDummyHash(): string {
    return DUMMY_HASH;
  }
}
