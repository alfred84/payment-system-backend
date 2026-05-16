import { DomainError } from '../../domain/shared/DomainError';
import { ErrorCode } from './ErrorCode';
import { HttpError } from './HttpError';

const DOMAIN_CODE_MAP: Record<string, { status: number; code: ErrorCode }> = {
  EMAIL_ALREADY_IN_USE: { status: 409, code: ErrorCode.CONFLICT },
  INVALID_CREDENTIALS: { status: 401, code: ErrorCode.UNAUTHORIZED },
  INVALID_REFRESH_TOKEN: { status: 401, code: ErrorCode.UNAUTHORIZED },
  REFRESH_TOKEN_REUSE: { status: 401, code: ErrorCode.UNAUTHORIZED },
  CARD_NOT_FOUND: { status: 404, code: ErrorCode.NOT_FOUND },
  PAYMENT_NOT_FOUND: { status: 404, code: ErrorCode.NOT_FOUND },
  IDEMPOTENCY_CONFLICT: { status: 409, code: ErrorCode.IDEMPOTENCY_CONFLICT },
  PROCESSOR_UNAVAILABLE: { status: 502, code: ErrorCode.PROCESSOR_UNAVAILABLE },
  INVALID_CARD: { status: 422, code: ErrorCode.VALIDATION_ERROR },
  INVALID_EMAIL: { status: 422, code: ErrorCode.VALIDATION_ERROR },
  INVALID_CURRENCY: { status: 422, code: ErrorCode.VALIDATION_ERROR },
  INVALID_CARD_TOKEN: { status: 422, code: ErrorCode.VALIDATION_ERROR },
  INVALID_IDEMPOTENCY_KEY: { status: 400, code: ErrorCode.VALIDATION_ERROR },
};

/**
 * Map a domain or value-object error to an {@link HttpError}.
 *
 * @param error - Caught error from a use case or value object factory.
 * @returns HTTP error with appropriate status and public code.
 */
export function mapDomainErrorToHttp(error: unknown): HttpError {
  if (error instanceof HttpError) {
    return error;
  }

  if (error instanceof DomainError) {
    const mapped = DOMAIN_CODE_MAP[error.code];
    if (mapped) {
      return new HttpError(mapped.status, mapped.code, error.message);
    }
    return new HttpError(500, ErrorCode.INTERNAL_ERROR, error.message);
  }

  return new HttpError(500, ErrorCode.INTERNAL_ERROR, 'An unexpected error occurred');
}
