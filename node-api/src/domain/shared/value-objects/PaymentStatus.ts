/** Payment lifecycle status. */
export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

const TERMINAL: ReadonlySet<PaymentStatus> = new Set(['APPROVED', 'REJECTED']);

/**
 * Whether the payment has reached a terminal state.
 *
 * @param status - Current payment status.
 * @returns True if approved or rejected.
 */
export function isTerminalPaymentStatus(status: PaymentStatus): boolean {
  return TERMINAL.has(status);
}
