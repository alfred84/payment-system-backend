import jwt from 'jsonwebtoken';

import type { AccessTokenPayload, TokenSigner } from '../../application/ports/TokenSigner';

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;

export interface JwtTokenSignerConfig {
  secret: string;
  issuer: string;
  audience: string;
}

/**
 * HS256 JWT implementation of {@link TokenSigner}.
 */
export class JwtTokenSigner implements TokenSigner {
  constructor(private readonly config: JwtTokenSignerConfig) {}

  /** @inheritdoc */
  signAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign({ email: payload.email }, this.config.secret, {
      subject: payload.sub,
      issuer: this.config.issuer,
      audience: this.config.audience,
      algorithm: 'HS256',
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    });
  }

  /** @inheritdoc */
  getAccessTokenExpiresInSeconds(): number {
    return ACCESS_TOKEN_TTL_SECONDS;
  }
}
