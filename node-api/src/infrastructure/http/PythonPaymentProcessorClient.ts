import { randomUUID } from 'node:crypto';

import { ProcessorUnavailableError } from '../../application/payments/errors';
import type {
  PaymentProcessorGateway,
  ProcessPaymentRequest,
  ProcessPaymentResult,
  TokenizeCardRequest,
  TokenizeCardResult,
} from '../../domain/payment/PaymentProcessorGateway';

interface ProcessorProcessResponse {
  approved: boolean;
  reference: string;
  message: string;
}

/**
 * HTTP client for the internal Python payment processor service.
 */
export class PythonPaymentProcessorClient implements PaymentProcessorGateway {
  constructor(
    private readonly processorUrl: string,
    private readonly timeoutMs = 10_000,
  ) {}

  /**
   * Tokenize card data via the processor (stub: opaque token until Python exposes /tokenize).
   *
   * @param _request - Card data (never persisted by this client).
   * @returns Opaque processor token.
   */
  tokenize(_request: TokenizeCardRequest): Promise<TokenizeCardResult> {
    return Promise.resolve({ token: `tok_${randomUUID().replace(/-/g, '')}` });
  }

  /**
   * Submit a payment for approval or rejection.
   *
   * @param request - Processor input.
   * @returns Processor decision.
   * @throws {ProcessorUnavailableError} When the processor cannot be reached.
   */
  async process(request: ProcessPaymentRequest): Promise<ProcessPaymentResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, this.timeoutMs);

    try {
      const response = await fetch(`${this.processorUrl}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_id: request.paymentId,
          amount: request.amount,
          currency: request.currency,
          card_token: request.cardToken,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new ProcessorUnavailableError();
      }

      const body = (await response.json()) as ProcessorProcessResponse;
      return {
        approved: body.approved,
        reference: body.reference,
        message: body.message,
      };
    } catch (error) {
      if (error instanceof ProcessorUnavailableError) {
        throw error;
      }
      throw new ProcessorUnavailableError();
    } finally {
      clearTimeout(timeout);
    }
  }
}
