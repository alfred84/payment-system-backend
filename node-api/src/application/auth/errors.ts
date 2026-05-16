import { DomainError } from '../../domain/shared/DomainError';

/** Thrown when email is already registered. */
export class EmailAlreadyInUseError extends DomainError {
  constructor() {
    super('Email already in use', 'EMAIL_ALREADY_IN_USE');
  }
}

/** Thrown when credentials are invalid (generic message). */
export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('Invalid credentials', 'INVALID_CREDENTIALS');
  }
}

/** Thrown when a refresh token is invalid or expired. */
export class InvalidRefreshTokenError extends DomainError {
  constructor() {
    super('Invalid refresh token', 'INVALID_REFRESH_TOKEN');
  }
}

/** Thrown when a revoked refresh token is reused (family revoked). */
export class RefreshTokenReuseError extends DomainError {
  constructor() {
    super('Refresh token reuse detected', 'REFRESH_TOKEN_REUSE');
  }
}
