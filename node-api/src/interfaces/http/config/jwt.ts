/** JWT verification settings for the authenticate middleware. */
export interface JwtVerifierConfig {
  secret: string;
  issuer: string;
  audience: string;
}
