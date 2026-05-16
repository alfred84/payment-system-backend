import { PaymentNotFoundError } from '../../domain/payment/errors';
import type { PaymentRepository } from '../../domain/payment/PaymentRepository';
import type { GetPaymentDetailInput, PaymentOutput } from '../dto/payment.dto';

/**
 * Fetch a single payment owned by the user.
 */
export class GetPaymentDetailUseCase {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  /**
   * Return payment details when owned by the user.
   *
   * @param input - Owner user id and payment id.
   * @returns Payment aggregate.
   * @throws {PaymentNotFoundError} When missing or not owned.
   *
   * @example
   *   const payment = await getPaymentDetail.execute({
   *     userId: '11111111-1111-4111-8111-111111111111',
   *     paymentId: '33333333-3333-4333-8333-333333333333',
   *   });
   */
  async execute(input: GetPaymentDetailInput): Promise<PaymentOutput> {
    const payment = await this.paymentRepository.findById(input.paymentId, input.userId);
    if (!payment) {
      throw new PaymentNotFoundError();
    }
    return payment;
  }
}
