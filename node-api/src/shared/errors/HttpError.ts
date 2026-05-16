import type { ErrorCode } from './ErrorCode';

export interface ErrorDetail {
  field: string;
  issue: string;
}

/**
 * HTTP-layer error with a stable public code and optional field details.
 */
export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: ErrorCode,
    message: string,
    public readonly details: ErrorDetail[] = [],
  ) {
    super(message);
    this.name = 'HttpError';
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}
