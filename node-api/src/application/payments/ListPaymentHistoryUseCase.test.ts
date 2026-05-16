import { Payment } from '../../domain/payment/Payment';
import type { PaymentRepository } from '../../domain/payment/PaymentRepository';
import { Currency } from '../../domain/shared/value-objects/Currency';
import { IdempotencyKey } from '../../domain/shared/value-objects/IdempotencyKey';
import { ListPaymentHistoryUseCase } from './ListPaymentHistoryUseCase';

describe('ListPaymentHistoryUseCase', () => {
  const now = new Date('2026-05-16T12:00:00.000Z');
  const userId = '11111111-1111-4111-8111-111111111111';

  const payment = Payment.restore({
    id: '33333333-3333-4333-8333-333333333333',
    userId,
    cardId: '22222222-2222-4222-8222-222222222222',
    amount: 19.99,
    currency: Currency.create('USD'),
    status: 'APPROVED',
    idempotencyKey: IdempotencyKey.create('8f5b3c2a-1d4e-4a9b-9c3d-2e1f0a9b8c7d'),
    processorReference: '44444444-4444-4444-8444-444444444444',
    processorMessage: 'Approved',
    description: null,
    metadata: {},
    createdAt: now,
    updatedAt: now,
  });

  const paymentRepository: jest.Mocked<PaymentRepository> = {
    findByIdempotencyKey: jest.fn(),
    findById: jest.fn(),
    listByUser: jest.fn().mockResolvedValue([payment]),
    save: jest.fn(),
    update: jest.fn(),
  };

  const useCase = new ListPaymentHistoryUseCase(paymentRepository);

  it('lists payments for the user with pagination', async () => {
    const cursorCreatedAt = new Date('2026-05-15T12:00:00.000Z');
    const cursorId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

    const result = await useCase.execute({
      userId,
      limit: 10,
      cursorCreatedAt,
      cursorId,
    });

    expect(paymentRepository.listByUser).toHaveBeenCalledWith({
      userId,
      limit: 10,
      cursor: { createdAt: cursorCreatedAt, id: cursorId },
    });
    expect(result).toEqual([payment]);
  });

  it('lists without a cursor when none is provided', async () => {
    await useCase.execute({ userId, limit: 5 });

    expect(paymentRepository.listByUser).toHaveBeenCalledWith({
      userId,
      limit: 5,
    });
  });
});
