import type { Email } from '../shared/value-objects/Email';

export interface RegisterUserProps {
  id: string;
  fullName: string;
  email: Email;
  passwordHash: string;
  now: Date;
}

/**
 * Registered account. Stores only the password hash — never plaintext passwords.
 */
export class User {
  private constructor(
    public readonly id: string,
    public readonly fullName: string,
    public readonly email: Email,
    public readonly passwordHash: string,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /**
   * Create a newly registered user.
   *
   * @param props - Registration properties (password must already be hashed).
   * @returns Active user entity.
   */
  static register(props: RegisterUserProps): User {
    return new User(
      props.id,
      props.fullName.trim(),
      props.email,
      props.passwordHash,
      true,
      props.now,
      props.now,
    );
  }

  /**
   * Reconstitute a user from persistence.
   *
   * @param props - Stored user fields.
   * @returns User entity.
   */
  static restore(props: {
    id: string;
    fullName: string;
    email: Email;
    passwordHash: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(
      props.id,
      props.fullName,
      props.email,
      props.passwordHash,
      props.isActive,
      props.createdAt,
      props.updatedAt,
    );
  }
}
