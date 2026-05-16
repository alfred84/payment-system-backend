import { Currency, InvalidCurrencyError } from './Currency';

describe('Currency', () => {
  it('accepts valid ISO 4217 codes', () => {
    expect(Currency.create('USD')).toBe('USD');
    expect(Currency.create('eur')).toBe('EUR');
  });

  it('rejects lowercase-only two-letter codes and invalid lengths', () => {
    expect(() => Currency.create('us')).toThrow(InvalidCurrencyError);
    expect(() => Currency.create('US')).toThrow(InvalidCurrencyError);
    expect(() => Currency.create('USDD')).toThrow(InvalidCurrencyError);
  });
});
