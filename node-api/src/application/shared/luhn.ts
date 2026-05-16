/**
 * Validate a card number with the Luhn algorithm.
 *
 * @param pan - Card number (digits only or with separators).
 * @returns True when the checksum is valid.
 */
export function isValidLuhn(pan: string): boolean {
  const digits = pan.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let n = Number.parseInt(digits.charAt(i), 10);
    if (alternate) {
      n *= 2;
      if (n > 9) {
        n -= 9;
      }
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}
