import type { RefreshToken } from '../../domain/auth/RefreshToken';
import type { RefreshTokenRepository } from '../../domain/auth/RefreshTokenRepository';
import type { LogoutInput } from '../dto/auth.dto';
import type { Clock } from '../ports/Clock';
import type { PasswordHasher } from '../ports/PasswordHasher';
import { parseRefreshToken } from './refreshTokenFormat';

/**
 * Revoke a refresh token (idempotent).
 */
export class LogoutUseCase {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly clock: Clock,
  ) {}

  /**
   * Revoke the presented refresh token if it exists.
   *
   * @param input - Refresh token to revoke.
   *
   * @example
   *   await logout.execute({
   *     refreshToken: '11111111-1111-4111-8111-111111111111.8f5b3c2a-1d4e-4a9b-9c3d-2e1f0a9b8c7d',
   *   });
   */
  async execute(input: LogoutInput): Promise<void> {
    const parsed = parseRefreshToken(input.refreshToken);
    if (!parsed) {
      return;
    }

    const tokens = await this.refreshTokenRepository.findAllByUserId(parsed.userId);
    const match = await this.findMatchingToken(input.refreshToken, tokens);
    if (!match || match.revoked) {
      return;
    }

    await this.refreshTokenRepository.update(match.revoke(this.clock.now()));
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
}
