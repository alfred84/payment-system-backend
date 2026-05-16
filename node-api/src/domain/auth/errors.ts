import { DomainError } from '../shared/DomainError';

/** Thrown when refresh token credentials are invalid. */
export class InvalidRefreshTokenError extends DomainError {
  constructor() {
    super('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
  }
}

/** Thrown when attempting to revoke an already revoked refresh token. */
export class RefreshTokenAlreadyRevokedError extends DomainError {
  constructor() {
    super('Refresh token is already revoked', 'REFRESH_TOKEN_ALREADY_REVOKED');
  }
}
