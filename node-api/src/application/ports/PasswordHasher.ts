/**
 * Password and refresh-token hashing port (bcrypt in infrastructure).
 */
export interface PasswordHasher {
  /**
   * Hash a plaintext secret.
   *
   * @param plain - Plaintext value.
   * @returns Bcrypt hash.
   */
  hash(plain: string): Promise<string>;

  /**
   * Compare plaintext to a stored hash (timing-safe).
   *
   * @param plain - Plaintext value.
   * @param hash - Stored hash.
   * @returns True when they match.
   */
  compare(plain: string, hash: string): Promise<boolean>;

  /**
   * Dummy hash used on authentication miss to reduce timing leaks.
   *
   * @returns Precomputed bcrypt hash.
   */
  getDummyHash(): string;
}
