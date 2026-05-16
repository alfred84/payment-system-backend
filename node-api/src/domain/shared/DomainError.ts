/**
 * Base class for all domain-layer errors.
 * Mapped to HTTP responses in the application/interfaces layers.
 */
export abstract class DomainError extends Error {
  /**
   * @param message - Human-readable error description.
   * @param code - Stable machine-readable error code.
   */
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
