import { CardToken, InvalidCardTokenError } from './CardToken';

describe('CardToken', () => {
  it('accepts non-empty opaque tokens', () => {
    expect(CardToken.create('tok_visa_4242')).toBe('tok_visa_4242');
  });

  it('rejects empty tokens', () => {
    expect(() => CardToken.create('   ')).toThrow(InvalidCardTokenError);
  });
});
