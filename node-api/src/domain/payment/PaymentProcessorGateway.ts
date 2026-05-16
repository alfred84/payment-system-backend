import type { Currency } from '../shared/value-objects/Currency';

export interface ProcessPaymentRequest {
  paymentId: string;
  amount: number;
  currency: Currency;
  cardToken: string;
}

export interface ProcessPaymentResult {
  approved: boolean;
  reference: string;
  message: string;
}

/**
 * Outbound port to the internal Python payment processor service.
 */
export interface PaymentProcessorGateway {
  /**
   * Submit a payment for approval/rejection.
   *
   * @param request - Processor input.
   * @returns Processor decision.
   */
  process(request: ProcessPaymentRequest): Promise<ProcessPaymentResult>;
}
