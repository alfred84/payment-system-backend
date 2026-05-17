import { UserNotFoundError } from '../../domain/user/errors';
import type { UserRepository } from '../../domain/user/UserRepository';
import type { UserOutput } from '../dto/user.dto';

export interface GetUserByIdInput {
  userId: string;
}

/**
 * Retrieve a single user by id.
 */
export class GetUserByIdUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Return a single user.
   *
   * @param input - User id to look up.
   * @returns User data.
   * @throws {UserNotFoundError} When the user does not exist.
   *
   * @example
   *   const user = await getUserById.execute({
   *     userId: '11111111-1111-4111-8111-111111111111',
   *   });
   */
  async execute(input: GetUserByIdInput): Promise<UserOutput> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
