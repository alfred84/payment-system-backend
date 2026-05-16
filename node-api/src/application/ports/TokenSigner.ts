export interface AccessTokenPayload {
  sub: string;
  email: string;
}

/**
 * JWT access-token signer port.
 */
export interface TokenSigner {
  /**
   * Sign a short-lived access token.
   *
   * @param payload - JWT claims.
   * @returns Signed JWT string.
   */
  signAccessToken(payload: AccessTokenPayload): string;

  /**
   * Access token lifetime in seconds (for API responses).
   *
   * @returns Expiry duration in seconds.
   */
  getAccessTokenExpiresInSeconds(): number;
}
