import { InvalidCardError } from '../../domain/card/errors';
import type { CardRepository } from '../../domain/card/CardRepository';
import type { PaymentProcessorGateway } from '../../domain/payment/PaymentProcessorGateway';
import { CardToken } from '../../domain/shared/value-objects/CardToken';
import type { Clock } from '../ports/Clock';
import type { UuidGenerator } from '../ports/UuidGenerator';
import { RegisterCardUseCase } from './RegisterCardUseCase';

describe('RegisterCardUseCase', () => {
  const now = new Date('2026-05-16T12:00:00.000Z');
  const userId = '11111111-1111-4111-8111-111111111111';
  const cardId = '22222222-2222-4222-8222-222222222222';

  const cardRepository: jest.Mocked<CardRepository> = {
    findById: jest.fn(),
    findActiveByUserId: jest.fn(),
    save: jest.fn(),
  };

  const processorGateway: jest.Mocked<PaymentProcessorGateway> = {
    tokenize: jest.fn().mockResolvedValue({ token: 'tok_processor_abc' }),
    process: jest.fn(),
  };

  const clock: jest.Mocked<Clock> = {
    now: jest.fn().mockReturnValue(now),
  };

  const uuidGenerator: jest.Mocked<UuidGenerator> = {
    generate: jest.fn().mockReturnValue(cardId),
  };

  const useCase = new RegisterCardUseCase(cardRepository, processorGateway, clock, uuidGenerator);

  const validInput = {
    userId,
    cardholderName: 'Ada Lovelace',
    cardNumber: '4242424242424242',
    expiryMonth: 12,
    expiryYear: 2030,
    cvv: '123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('tokenizes via processor and saves only safe fields', async () => {
    const result = await useCase.execute(validInput);

    expect(processorGateway.tokenize).toHaveBeenCalledWith({
      cardNumber: '4242424242424242',
      expiryMonth: 12,
      expiryYear: 2030,
      cvv: '123',
      cardholderName: 'Ada Lovelace',
    });
    expect(cardRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        lastFourDigits: '4242',
        brand: 'VISA',
        token: CardToken.create('tok_processor_abc'),
      }),
    );
    expect(result).toMatchObject({
      id: cardId,
      lastFourDigits: '4242',
      brand: 'VISA',
      maskedPan: '**** **** **** 4242',
    });
  });

  it('rejects invalid Luhn numbers', async () => {
    await expect(
      useCase.execute({ ...validInput, cardNumber: '4242424242424241' }),
    ).rejects.toThrow(InvalidCardError);
    expect(processorGateway.tokenize).not.toHaveBeenCalled();
  });

  it('rejects expired cards', async () => {
    await expect(
      useCase.execute({
        ...validInput,
        expiryMonth: 1,
        expiryYear: 2020,
      }),
    ).rejects.toThrow(InvalidCardError);
  });
});
