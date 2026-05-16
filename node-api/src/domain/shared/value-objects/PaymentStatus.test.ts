import { isTerminalPaymentStatus } from './PaymentStatus';

describe('PaymentStatus', () => {
  it('identifies terminal statuses', () => {
    expect(isTerminalPaymentStatus('APPROVED')).toBe(true);
    expect(isTerminalPaymentStatus('REJECTED')).toBe(true);
    expect(isTerminalPaymentStatus('PENDING')).toBe(false);
  });
});
