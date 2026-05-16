/**
 * Injectable UUID generator.
 */
export interface UuidGenerator {
  /**
   * Generate a new UUID v4.
   *
   * @returns UUID string.
   */
  generate(): string;
}
