import { Card } from '../../domain/card/Card';
import { CardNotFoundError } from '../../domain/card/errors';
import type { CardRepository } from '../../domain/card/CardRepository';
import { CardToken } from '../../domain/shared/value-objects/CardToken';
import { SoftDeleteCardUseCase } from './SoftDeleteCardUseCase';

describe('SoftDeleteCardUseCase', () => {
  const now = new Date('2026-05-16T12:00:00.000Z');
  const userId = '11111111-1111-4111-8111-111111111111';
  const cardId = '22222222-2222-4222-8222-222222222222';

  const activeCard = Card.restore({
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

  const cardRepository: jest.Mocked<CardRepository> = {
    findById: jest.fn(),
    findActiveByUserId: jest.fn(),
    save: jest.fn(),
  };

  const useCase = new SoftDeleteCardUseCase(cardRepository);

  beforeEach(() => {
    jest.clearAllMocks();
    cardRepository.findById.mockResolvedValue(activeCard);
  });

  it('deactivates an owned card', async () => {
    await useCase.execute({ userId, cardId });

    expect(cardRepository.save).toHaveBeenCalledWith(expect.objectContaining({ isActive: false }));
  });

  it('throws CardNotFoundError when the card is not owned', async () => {
    cardRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ userId, cardId })).rejects.toThrow(CardNotFoundError);
  });

  it('is idempotent when the card is already inactive', async () => {
    cardRepository.findById.mockResolvedValue(activeCard.deactivate());

    await useCase.execute({ userId, cardId });

    expect(cardRepository.save).not.toHaveBeenCalled();
  });
});
