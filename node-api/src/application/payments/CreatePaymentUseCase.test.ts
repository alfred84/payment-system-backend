import { Card } from '../../domain/card/Card';
import { CardNotFoundError } from '../../domain/card/errors';
import type { CardRepository } from '../../domain/card/CardRepository';
import { Payment } from '../../domain/payment/Payment';
import { IdempotencyConflictError, IdempotencyRaceError } from '../../domain/payment/errors';
import type { PaymentRepository } from '../../domain/payment/PaymentRepository';
import type { PaymentProcessorGateway } from '../../domain/payment/PaymentProcessorGateway';
import { Currency } from '../../domain/shared/value-objects/Currency';
import { CardToken } from '../../domain/shared/value-objects/CardToken';
import { IdempotencyKey } from '../../domain/shared/value-objects/IdempotencyKey';
import { buildPaymentFingerprint, withPaymentFingerprint } from '../shared/idempotencyFingerprint';
import type { Clock } from '../ports/Clock';
import type { UuidGenerator } from '../ports/UuidGenerator';
import { CreatePaymentUseCase } from './CreatePaymentUseCase';
import { ProcessorUnavailableError } from './errors';

describe('CreatePaymentUseCase', () => {
  const now = new Date('2026-05-16T12:00:00.000Z');
  const userId = '11111111-1111-4111-8111-111111111111';
  const cardId = '22222222-2222-4222-8222-222222222222';
  const paymentId = '33333333-3333-4333-8333-333333333333';
  const idempotencyKey = '8f5b3c2a-1d4e-4a9b-9c3d-2e1f0a9b8c7d';

  const card = Card.restore({
    id: cardId,
    userId,
    cardholderName: 'Ada Lovelace',
    lastFourDigits: '4242',
    brand: 'VISA',
    expiryMonth: 12,
    expiryYear: 2030,
    token: CardToken.create('tok_abc'),
    isActive: true,
    createdAt: now,
  });

  const paymentRepository: jest.Mocked<PaymentRepository> = {
    findByIdempotencyKey: jest.fn().mockResolvedValue(null),
    findById: jest.fn(),
    listByUser: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const cardRepository: jest.Mocked<CardRepository> = {
    findById: jest.fn().mockResolvedValue(card),
    findActiveByUserId: jest.fn(),
    save: jest.fn(),
  };

  const processorGateway: jest.Mocked<PaymentProcessorGateway> = {
    tokenize: jest.fn(),
    process: jest.fn().mockResolvedValue({
      approved: true,
      reference: '44444444-4444-4444-8444-444444444444',
      message: 'Approved',
    }),
  };

  const clock: jest.Mocked<Clock> = {
    now: jest.fn().mockReturnValue(now),
  };

  const uuidGenerator: jest.Mocked<UuidGenerator> = {
    generate: jest.fn().mockReturnValue(paymentId),
  };

  const useCase = new CreatePaymentUseCase(
    paymentRepository,
    cardRepository,
    processorGateway,
    clock,
    uuidGenerator,
  );

  const baseInput = {
    userId,
    cardId,
    amount: 19.99,
    currency: 'USD',
    idempotencyKey,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    paymentRepository.findByIdempotencyKey.mockResolvedValue(null);
    cardRepository.findById.mockResolvedValue(card);
  });

  it('creates an approved payment through the processor', async () => {
    const result = await useCase.execute(baseInput);

    expect(paymentRepository.save).toHaveBeenCalled();
    expect(processorGateway.process).toHaveBeenCalledWith({
      paymentId,
      amount: 19.99,
      currency: Currency.create('USD'),
      cardToken: 'tok_abc',
    });
    expect(paymentRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'APPROVED' }),
    );
    expect(result.status).toBe('APPROVED');
  });

  it('persists rejection when the processor declines', async () => {
    processorGateway.process.mockResolvedValue({
      approved: false,
      reference: '44444444-4444-4444-8444-444444444444',
      message: 'Declined',
    });

    const result = await useCase.execute(baseInput);

    expect(paymentRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'REJECTED' }),
    );
    expect(result.status).toBe('REJECTED');
  });

  it('returns the stored payment on idempotency hit', async () => {
    const fingerprint = buildPaymentFingerprint({
      cardId,
      amount: 19.99,
      currency: 'USD',
    });
    const existing = Payment.restore({
      id: paymentId,
      userId,
      cardId,
      amount: 19.99,
      currency: Currency.create('USD'),
      status: 'APPROVED',
      idempotencyKey: IdempotencyKey.create(idempotencyKey),
      processorReference: '44444444-4444-4444-8444-444444444444',
      processorMessage: 'Approved',
      description: null,
      metadata: withPaymentFingerprint({}, fingerprint),
      createdAt: now,
      updatedAt: now,
    });
    paymentRepository.findByIdempotencyKey.mockResolvedValue(existing);

    const result = await useCase.execute(baseInput);

    expect(result).toBe(existing);
    expect(paymentRepository.save).not.toHaveBeenCalled();
    expect(processorGateway.process).not.toHaveBeenCalled();
  });

  it('throws IdempotencyConflictError when the body differs', async () => {
    const existing = Payment.restore({
      id: paymentId,
      userId,
      cardId,
      amount: 99.99,
      currency: Currency.create('USD'),
      status: 'APPROVED',
      idempotencyKey: IdempotencyKey.create(idempotencyKey),
      processorReference: null,
      processorMessage: null,
      description: null,
      metadata: withPaymentFingerprint(
        {},
        buildPaymentFingerprint({ cardId, amount: 99.99, currency: 'USD' }),
      ),
      createdAt: now,
      updatedAt: now,
    });
    paymentRepository.findByIdempotencyKey.mockResolvedValue(existing);

    await expect(useCase.execute(baseInput)).rejects.toThrow(IdempotencyConflictError);
  });

  it('throws CardNotFoundError when the card is missing or inactive', async () => {
    cardRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(baseInput)).rejects.toThrow(CardNotFoundError);
  });

  it('propagates ProcessorUnavailableError without finalizing', async () => {
    processorGateway.process.mockRejectedValue(new ProcessorUnavailableError());

    await expect(useCase.execute(baseInput)).rejects.toThrow(ProcessorUnavailableError);
    expect(paymentRepository.update).not.toHaveBeenCalled();
  });

  it('returns the existing payment when a concurrent insert races on save', async () => {
    const fingerprint = buildPaymentFingerprint({
      cardId,
      amount: 19.99,
      currency: 'USD',
    });
    const existing = Payment.restore({
      id: paymentId,
      userId,
      cardId,
      amount: 19.99,
      currency: Currency.create('USD'),
      status: 'PENDING',
      idempotencyKey: IdempotencyKey.create(idempotencyKey),
      processorReference: null,
      processorMessage: null,
      description: null,
      metadata: withPaymentFingerprint({}, fingerprint),
      createdAt: now,
      updatedAt: now,
    });

    paymentRepository.save.mockRejectedValueOnce(new IdempotencyRaceError());
    paymentRepository.findByIdempotencyKey.mockResolvedValueOnce(null).mockResolvedValue(existing);

    const result = await useCase.execute(baseInput);

    expect(result).toBe(existing);
    expect(processorGateway.process).not.toHaveBeenCalled();
  });
});
