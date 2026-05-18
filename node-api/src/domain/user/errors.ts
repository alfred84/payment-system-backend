import { DomainError } from '../shared/DomainError';

/** Thrown when a user cannot be found. */
export class UserNotFoundError extends DomainError {
  constructor() {
    super('User not found', 'USER_NOT_FOUND');
  }
}

/** Thrown when a user email is already registered. */
export class EmailAlreadyInUseError extends DomainError {
  constructor() {
    super('Email already in use', 'EMAIL_ALREADY_IN_USE');
  }
}
