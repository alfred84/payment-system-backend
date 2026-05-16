import { InvalidRefreshTokenError, RefreshTokenAlreadyRevokedError } from './errors';

describe('auth domain errors', () => {
  it('exposes stable error codes', () => {
    expect(new InvalidRefreshTokenError().code).toBe('INVALID_REFRESH_TOKEN');
    expect(new RefreshTokenAlreadyRevokedError().code).toBe('REFRESH_TOKEN_ALREADY_REVOKED');
  });
});
