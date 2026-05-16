import { isValidLuhn } from './luhn';

describe('isValidLuhn', () => {
  it('accepts a valid Visa test PAN', () => {
    expect(isValidLuhn('4242424242424242')).toBe(true);
  });

  it('rejects an invalid checksum', () => {
    expect(isValidLuhn('4242424242424241')).toBe(false);
  });

  it('rejects numbers that are too short', () => {
    expect(isValidLuhn('424242')).toBe(false);
  });
});
