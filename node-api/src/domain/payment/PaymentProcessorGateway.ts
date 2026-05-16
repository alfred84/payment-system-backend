import type { Currency } from '../shared/value-objects/Currency';

export interface TokenizeCardRequest {
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  cardholderName: string;
}

export interface TokenizeCardResult {
  token: string;
}

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
   * Tokenize a card for storage (PAN and CVV must not be persisted).
   *
   * @param request - Card data for tokenization.
   * @returns Opaque processor token.
   */
  tokenize(request: TokenizeCardRequest): Promise<TokenizeCardResult>;

  /**
   * Submit a payment for approval/rejection.
   *
   * @param request - Processor input.
   * @returns Processor decision.
   */
  process(request: ProcessPaymentRequest): Promise<ProcessPaymentResult>;
}
