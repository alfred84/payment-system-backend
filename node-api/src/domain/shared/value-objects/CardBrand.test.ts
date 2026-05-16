import { CardBrand } from './CardBrand';

describe('CardBrand', () => {
  it('detects VISA from PAN prefix', () => {
    expect(CardBrand.fromPan('4111111111111111')).toBe('VISA');
  });

  it('detects MASTERCARD from PAN prefix', () => {
    expect(CardBrand.fromPan('5555555555554444')).toBe('MASTERCARD');
  });

  it('falls back to OTHER for unknown prefixes', () => {
    expect(CardBrand.fromPan('1234567890123456')).toBe('OTHER');
  });

  it('detects AMEX from PAN prefix', () => {
    expect(CardBrand.fromPan('378282246310005')).toBe('AMEX');
  });
});
