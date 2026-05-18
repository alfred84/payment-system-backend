import { User } from '../../domain/user/User';
import { EmailAlreadyInUseError } from '../../domain/user/errors';
import type { UserRepository } from '../../domain/user/UserRepository';
import { Email } from '../../domain/shared/value-objects/Email';
import type { CreateUserInput, UserOutput } from '../dto/user.dto';
import type { Clock } from '../ports/Clock';
import type { UuidGenerator } from '../ports/UuidGenerator';

/**
 * Create a new user account (no password, no credentials).
 */
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly clock: Clock,
    private readonly uuidGenerator: UuidGenerator,
  ) {}

  /**
   * Create a user identified by fullName and email.
   *
   * @param input - User creation data.
   * @returns Created user data.
   * @throws {EmailAlreadyInUseError} When the email is already registered.
   *
   * @example
   *   const user = await createUser.execute({
   *     fullName: 'Ada Lovelace',
   *     email: 'ada@example.com',
   *   });
   */
  async execute(input: CreateUserInput): Promise<UserOutput> {
    const email = Email.create(input.email);
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new EmailAlreadyInUseError();
    }

    const now = this.clock.now();
    const user = User.create({
      id: this.uuidGenerator.generate(),
      fullName: input.fullName,
      email,
      now,
    });
    await this.userRepository.save(user);

    return {
      id: user.id,
      fullName: user.fullName,
      email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
