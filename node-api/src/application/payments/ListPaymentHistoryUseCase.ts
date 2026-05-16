import type { PaymentRepository } from '../../domain/payment/PaymentRepository';
import type { ListPaymentHistoryInput, PaymentOutput } from '../dto/payment.dto';

/**
 * List payments for a user with keyset pagination.
 */
export class ListPaymentHistoryUseCase {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  /**
   * Return a page of payments owned by the user.
   *
   * @param input - Owner id, limit, and optional cursor.
   * @returns Payment aggregates for the page.
   *
   * @example
   *   const payments = await listPaymentHistory.execute({
   *     userId: '11111111-1111-4111-8111-111111111111',
   *     limit: 20,
   *   });
   */
  async execute(input: ListPaymentHistoryInput): Promise<PaymentOutput[]> {
    const query = {
      userId: input.userId,
      limit: input.limit,
      ...(input.cursorCreatedAt && input.cursorId
        ? { cursor: { createdAt: input.cursorCreatedAt, id: input.cursorId } }
        : {}),
    };

    return this.paymentRepository.listByUser(query);
  }
}
