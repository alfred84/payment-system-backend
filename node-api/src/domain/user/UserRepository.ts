import type { Email } from '../shared/value-objects/Email';
import type { User } from './User';

/**
 * Persistence port for {@link User} aggregates.
 */
export interface UserRepository {
  /**
   * Find a user by email address.
   *
   * @param email - Validated email.
   * @returns User if found, otherwise null.
   */
  findByEmail(email: Email): Promise<User | null>;

  /**
   * Find a user by primary key.
   *
   * @param id - User UUID.
   * @returns User if found, otherwise null.
   */
  findById(id: string): Promise<User | null>;

  /**
   * Persist a new or updated user.
   *
   * @param user - User entity.
   */
  save(user: User): Promise<void>;
}
