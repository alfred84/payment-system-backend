import type { UserRepository } from '../../domain/user/UserRepository';
import { User } from '../../domain/user/User';
import { Email } from '../../domain/shared/value-objects/Email';
import type { RegisterUserInput } from '../dto/auth.dto';
import type { Clock } from '../ports/Clock';
import type { PasswordHasher } from '../ports/PasswordHasher';
import type { UuidGenerator } from '../ports/UuidGenerator';
import { EmailAlreadyInUseError } from './errors';

export interface RegisterUserOutput {
  id: string;
  fullName: string;
  email: string;
}

/**
 * Register a new user account.
 */
export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly clock: Clock,
    private readonly uuidGenerator: UuidGenerator,
  ) {}

  /**
   * Register a user with a hashed password.
   *
   * @param input - Registration data.
   * @returns Created user identifiers.
   * @throws {EmailAlreadyInUseError} When the email is already registered.
   *
   * @example
   *   const user = await registerUser.execute({
   *     fullName: 'Ada Lovelace',
   *     email: 'ada@example.com',
   *     password: 'correct horse battery staple',
   *   });
   */
  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    const email = Email.create(input.email);
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new EmailAlreadyInUseError();
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const now = this.clock.now();
    const user = User.register({
      id: this.uuidGenerator.generate(),
      fullName: input.fullName,
      email,
      passwordHash,
      now,
    });
    await this.userRepository.save(user);

    return {
      id: user.id,
      fullName: user.fullName,
      email,
    };
  }
}
