import type { UserRepository } from '../../domain/user/UserRepository';
import type { UserOutput } from '../dto/user.dto';

/**
 * List all registered users.
 */
export class ListUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Return all users.
   *
   * @returns Array of user data.
   *
   * @example
   *   const users = await listUsers.execute();
   */
  async execute(): Promise<UserOutput[]> {
    const users = await this.userRepository.findAll();
    return users.map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));
  }
}
