import { Payment } from '../../domain/payment/Payment';
import { PaymentNotFoundError } from '../../domain/payment/errors';
import type { PaymentRepository } from '../../domain/payment/PaymentRepository';
import { Currency } from '../../domain/shared/value-objects/Currency';
import { IdempotencyKey } from '../../domain/shared/value-objects/IdempotencyKey';
import { GetPaymentDetailUseCase } from './GetPaymentDetailUseCase';

describe('GetPaymentDetailUseCase', () => {
  const now = new Date('2026-05-16T12:00:00.000Z');
  const userId = '11111111-1111-4111-8111-111111111111';
  const paymentId = '33333333-3333-4333-8333-333333333333';

  const payment = Payment.restore({
    id: paymentId,
    userId,
    cardId: '22222222-2222-4222-8222-222222222222',
    amount: 19.99,
    currency: Currency.create('USD'),
    status: 'APPROVED',
    idempotencyKey: IdempotencyKey.create('8f5b3c2a-1d4e-4a9b-9c3d-2e1f0a9b8c7d'),
    processorReference: null,
    processorMessage: null,
    description: null,
    metadata: {},
    createdAt: now,
    updatedAt: now,
  });

  const paymentRepository: jest.Mocked<PaymentRepository> = {
    findByIdempotencyKey: jest.fn(),
    findById: jest.fn(),
    listByUser: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const useCase = new GetPaymentDetailUseCase(paymentRepository);

  it('returns the payment when owned by the user', async () => {
    paymentRepository.findById.mockResolvedValue(payment);

    const result = await useCase.execute({ userId, paymentId });

    expect(paymentRepository.findById).toHaveBeenCalledWith(paymentId, userId);
    expect(result).toBe(payment);
  });

  it('throws PaymentNotFoundError when missing or foreign', async () => {
    paymentRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ userId, paymentId })).rejects.toThrow(PaymentNotFoundError);
  });
});
