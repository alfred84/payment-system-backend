import { RefreshToken } from '../../domain/auth/RefreshToken';
import type { RefreshTokenRepository } from '../../domain/auth/RefreshTokenRepository';
import { Email } from '../../domain/shared/value-objects/Email';
import type { UserRepository } from '../../domain/user/UserRepository';
import type { AuthenticateUserInput, AuthTokensOutput } from '../dto/auth.dto';
import { REFRESH_TOKEN_TTL_MS } from '../shared/constants';
import type { Clock } from '../ports/Clock';
import type { PasswordHasher } from '../ports/PasswordHasher';
import type { TokenSigner } from '../ports/TokenSigner';
import type { UuidGenerator } from '../ports/UuidGenerator';
import { formatRefreshToken } from './refreshTokenFormat';
import { InvalidCredentialsError } from './errors';

/**
 * Authenticate a user and issue access + refresh tokens.
 */
export class AuthenticateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenSigner: TokenSigner,
    private readonly clock: Clock,
    private readonly uuidGenerator: UuidGenerator,
  ) {}

  /**
   * Validate credentials and return JWT + refresh token pair.
   *
   * @param input - Login credentials.
   * @returns Access and refresh tokens.
   * @throws {InvalidCredentialsError} When email or password is wrong.
   *
   * @example
   *   const tokens = await authenticateUser.execute({
   *     email: 'ada@example.com',
   *     password: 'correct horse battery staple',
   *   });
   */
  async execute(input: AuthenticateUserInput): Promise<AuthTokensOutput> {
    const email = Email.create(input.email);
    const user = await this.userRepository.findByEmail(email);
    const hashToCompare = user?.passwordHash ?? this.passwordHasher.getDummyHash();
    const passwordMatches = await this.passwordHasher.compare(input.password, hashToCompare);

    if (!user || !passwordMatches) {
      throw new InvalidCredentialsError();
    }

    const now = this.clock.now();
    const refreshTokenId = this.uuidGenerator.generate();
    const plainRefreshToken = formatRefreshToken(user.id, refreshTokenId);
    const tokenHash = await this.passwordHasher.hash(plainRefreshToken);
    const expiresAt = new Date(now.getTime() + REFRESH_TOKEN_TTL_MS);

    const refreshToken = RefreshToken.create({
      id: refreshTokenId,
      userId: user.id,
      tokenHash,
      expiresAt,
      createdAt: now,
    });
    await this.refreshTokenRepository.save(refreshToken);

    return {
      accessToken: this.tokenSigner.signAccessToken({ sub: user.id, email }),
      refreshToken: plainRefreshToken,
      expiresIn: this.tokenSigner.getAccessTokenExpiresInSeconds(),
    };
  }
}
