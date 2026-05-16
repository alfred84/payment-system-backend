import { DomainError } from '../shared/DomainError';

/** Thrown when a user cannot be found. */
export class UserNotFoundError extends DomainError {
  constructor() {
    super('User not found', 'USER_NOT_FOUND');
  }
}
