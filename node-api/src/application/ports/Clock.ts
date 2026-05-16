/**
 * Injectable clock for deterministic tests.
 */
export interface Clock {
  /**
   * Current timestamp.
   *
   * @returns Current date.
   */
  now(): Date;
}
