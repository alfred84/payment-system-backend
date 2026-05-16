import { RefreshToken } from '../../domain/auth/RefreshToken';
import type { RefreshTokenRepository } from '../../domain/auth/RefreshTokenRepository';
import type { UserRepository } from '../../domain/user/UserRepository';
import type { AuthTokensOutput, RefreshAccessTokenInput } from '../dto/auth.dto';
import { REFRESH_TOKEN_TTL_MS } from '../shared/constants';
import type { Clock } from '../ports/Clock';
import type { PasswordHasher } from '../ports/PasswordHasher';
import type { TokenSigner } from '../ports/TokenSigner';
import type { UuidGenerator } from '../ports/UuidGenerator';
import { formatRefreshToken, parseRefreshToken } from './refreshTokenFormat';
import { InvalidRefreshTokenError, RefreshTokenReuseError } from './errors';

/**
 * Rotate refresh tokens and issue a new access token.
 */
export class RefreshAccessTokenUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenSigner: TokenSigner,
    private readonly clock: Clock,
    private readonly uuidGenerator: UuidGenerator,
  ) {}

  /**
   * Exchange a valid refresh token for a new token pair.
   *
   * @param input - Refresh token from the client.
   * @returns New access and refresh tokens.
   * @throws {InvalidRefreshTokenError} When the token is unknown or expired.
   * @throws {RefreshTokenReuseError} When a revoked token is reused.
   *
   * @example
   *   const tokens = await refreshAccessToken.execute({
   *     refreshToken: '11111111-1111-4111-8111-111111111111.8f5b3c2a-1d4e-4a9b-9c3d-2e1f0a9b8c7d',
   *   });
   */
  async execute(input: RefreshAccessTokenInput): Promise<AuthTokensOutput> {
    const parsed = parseRefreshToken(input.refreshToken);
    if (!parsed) {
      throw new InvalidRefreshTokenError();
    }

    const allTokens = await this.refreshTokenRepository.findAllByUserId(parsed.userId);
    const match = await this.findMatchingToken(input.refreshToken, allTokens);
    if (!match) {
      throw new InvalidRefreshTokenError();
    }

    const now = this.clock.now();

    if (match.revoked) {
      await this.revokeAllActive(parsed.userId, now);
      throw new RefreshTokenReuseError();
    }

    if (match.isExpired(now)) {
      throw new InvalidRefreshTokenError();
    }

    const user = await this.userRepository.findById(parsed.userId);
    if (!user) {
      throw new InvalidRefreshTokenError();
    }

    const newTokenId = this.uuidGenerator.generate();
    const plainRefreshToken = formatRefreshToken(user.id, newTokenId);
    const tokenHash = await this.passwordHasher.hash(plainRefreshToken);
    const expiresAt = new Date(now.getTime() + REFRESH_TOKEN_TTL_MS);

    const replacement = RefreshToken.create({
      id: newTokenId,
      userId: user.id,
      tokenHash,
      expiresAt,
      createdAt: now,
    });
    const rotated = match.markReplacedBy(newTokenId, now);

    await this.refreshTokenRepository.save(replacement);
    await this.refreshTokenRepository.update(rotated);

    return {
      accessToken: this.tokenSigner.signAccessToken({ sub: user.id, email: user.email }),
      refreshToken: plainRefreshToken,
      expiresIn: this.tokenSigner.getAccessTokenExpiresInSeconds(),
    };
  }

  private async findMatchingToken(
    plain: string,
    tokens: RefreshToken[],
  ): Promise<RefreshToken | null> {
    for (const token of tokens) {
      const matches = await this.passwordHasher.compare(plain, token.tokenHash);
      if (matches) {
        return token;
      }
    }
    return null;
  }

  private async revokeAllActive(userId: string, now: Date): Promise<void> {
    const activeTokens = await this.refreshTokenRepository.findActiveByUserId(userId);
    await Promise.all(
      activeTokens.map(async (token) => {
        await this.refreshTokenRepository.update(token.revoke(now));
      }),
    );
  }
}
