import { RefreshTokenAlreadyRevokedError } from './errors';

export interface CreateRefreshTokenProps {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}

/**
 * Opaque refresh token stored as a bcrypt hash in the database.
 */
export class RefreshToken {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly tokenHash: string,
    public readonly expiresAt: Date,
    public readonly revoked: boolean,
    public readonly replacedById: string | null,
    public readonly createdAt: Date,
    public readonly revokedAt: Date | null,
  ) {}

  /**
   * Create a new active refresh token.
   *
   * @param props - Token creation data (hash only, never the plain token).
   * @returns RefreshToken entity.
   */
  static create(props: CreateRefreshTokenProps): RefreshToken {
    return new RefreshToken(
      props.id,
      props.userId,
      props.tokenHash,
      props.expiresAt,
      false,
      null,
      props.createdAt,
      null,
    );
  }

  /**
   * Reconstitute a refresh token from persistence.
   *
   * @param props - Stored token fields.
   * @returns RefreshToken entity.
   */
  static restore(props: {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    revoked: boolean;
    replacedById: string | null;
    createdAt: Date;
    revokedAt: Date | null;
  }): RefreshToken {
    return new RefreshToken(
      props.id,
      props.userId,
      props.tokenHash,
      props.expiresAt,
      props.revoked,
      props.replacedById,
      props.createdAt,
      props.revokedAt,
    );
  }

  /**
   * Whether the token has expired relative to the given time.
   *
   * @param now - Current timestamp.
   * @returns True if expired.
   */
  isExpired(now: Date): boolean {
    return now >= this.expiresAt;
  }

  /**
   * Revoke this refresh token.
   *
   * @param now - Revocation timestamp.
   * @returns Revoked token copy.
   * @throws {RefreshTokenAlreadyRevokedError} When already revoked.
   */
  revoke(now: Date): RefreshToken {
    if (this.revoked) {
      throw new RefreshTokenAlreadyRevokedError();
    }
    return new RefreshToken(
      this.id,
      this.userId,
      this.tokenHash,
      this.expiresAt,
      true,
      this.replacedById,
      this.createdAt,
      now,
    );
  }

  /**
   * Link this token to its replacement during rotation.
   *
   * @param replacementId - ID of the new refresh token row.
   * @param now - Rotation timestamp.
   * @returns Revoked token with replacedById set.
   */
  markReplacedBy(replacementId: string, now: Date): RefreshToken {
    const revoked = this.revoke(now);
    return new RefreshToken(
      revoked.id,
      revoked.userId,
      revoked.tokenHash,
      revoked.expiresAt,
      true,
      replacementId,
      revoked.createdAt,
      revoked.revokedAt,
    );
  }
}
