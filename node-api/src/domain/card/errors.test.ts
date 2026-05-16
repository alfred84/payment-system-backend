import { CardNotFoundError, InvalidCardError } from './errors';

describe('card domain errors', () => {
  it('exposes stable error codes', () => {
    expect(new InvalidCardError('invalid').code).toBe('INVALID_CARD');
    expect(new CardNotFoundError().code).toBe('CARD_NOT_FOUND');
  });
});
