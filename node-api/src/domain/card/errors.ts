import { DomainError } from '../shared/DomainError';

/** Thrown when card data fails domain validation. */
export class InvalidCardError extends DomainError {
  constructor(message: string) {
    super(message, 'INVALID_CARD');
  }
}

/** Thrown when a card cannot be found or is not owned by the user. */
export class CardNotFoundError extends DomainError {
  constructor() {
    super('Card not found', 'CARD_NOT_FOUND');
  }
}
