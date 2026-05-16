/** Supported card network brands. */
export type CardBrand = 'VISA' | 'MASTERCARD' | 'AMEX' | 'OTHER';

/**
 * Infer card brand from the primary account number (PAN).
 * Only the prefix is inspected; the full PAN must never be persisted.
 *
 * @param pan - Full card number (used only for brand detection).
 * @returns Detected card brand.
 */
export const CardBrand = {
  fromPan(pan: string): CardBrand {
    const digits = pan.replace(/\D/g, '');
    if (digits.startsWith('4')) {
      return 'VISA';
    }
    if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) {
      return 'MASTERCARD';
    }
    if (/^3[47]/.test(digits)) {
      return 'AMEX';
    }
    return 'OTHER';
  },
};
