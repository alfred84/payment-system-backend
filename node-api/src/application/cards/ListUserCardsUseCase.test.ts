import { Card } from '../../domain/card/Card';
import type { CardRepository } from '../../domain/card/CardRepository';
import { CardToken } from '../../domain/shared/value-objects/CardToken';
import { ListUserCardsUseCase } from './ListUserCardsUseCase';

describe('ListUserCardsUseCase', () => {
  const now = new Date('2026-05-16T12:00:00.000Z');
  const userId = '11111111-1111-4111-8111-111111111111';

  const activeCard = Card.restore({
    id: '22222222-2222-4222-8222-222222222222',
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
    findActiveByUserId: jest.fn().mockResolvedValue([activeCard]),
    save: jest.fn(),
  };

  const useCase = new ListUserCardsUseCase(cardRepository);

  it('returns only active cards for the user', async () => {
    const result = await useCase.execute({ userId });

    expect(cardRepository.findActiveByUserId).toHaveBeenCalledWith(userId);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: activeCard.id,
      lastFourDigits: '4242',
      maskedPan: '**** **** **** 4242',
    });
    expect(result[0]).not.toHaveProperty('token');
  });
});
