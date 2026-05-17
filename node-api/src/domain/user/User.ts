import type { Email } from '../shared/value-objects/Email';

export interface CreateUserProps {
  id: string;
  fullName: string;
  email: Email;
  now: Date;
}

/**
 * User aggregate — identity record with no credential storage.
 * Identity is resolved by the `userId` in the URL or request body.
 */
export class User {
  private constructor(
    public readonly id: string,
    public readonly fullName: string,
    public readonly email: Email,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /**
   * Create a new user.
   *
   * @param props - Creation properties.
   * @returns User entity.
   */
  static create(props: CreateUserProps): User {
    return new User(props.id, props.fullName.trim(), props.email, props.now, props.now);
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
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(props.id, props.fullName, props.email, props.createdAt, props.updatedAt);
  }
}
