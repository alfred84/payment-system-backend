import { CardToken } from '../shared/value-objects/CardToken';
import { InvalidCardError } from './errors';
import { Card } from './Card';

describe('Card', () => {
  const now = new Date('2026-05-16T12:00:00.000Z');

  it('masks the last four digits for display', () => {
    const card = Card.create({
      id: '22222222-2222-4222-8222-222222222222',
      userId: '11111111-1111-4111-8111-111111111111',
      cardholderName: 'Ada Lovelace',
      lastFourDigits: '4242',
      brand: 'VISA',
      expiryMonth: 12,
      expiryYear: 2030,
      token: CardToken.create('tok_visa_4242'),
      now,
    });

    expect(card.mask()).toBe('**** **** **** 4242');
  });

  it('rejects invalid last four digits', () => {
    expect(() =>
      Card.create({
        id: '22222222-2222-4222-8222-222222222222',
        userId: '11111111-1111-4111-8111-111111111111',
        cardholderName: 'Ada Lovelace',
        lastFourDigits: '42',
        brand: 'VISA',
        expiryMonth: 12,
        expiryYear: 2030,
        token: CardToken.create('tok_visa_4242'),
        now,
      }),
    ).toThrow(InvalidCardError);
  });

  it('rejects expired cards', () => {
    expect(() =>
      Card.create({
        id: '22222222-2222-4222-8222-222222222222',
        userId: '11111111-1111-4111-8111-111111111111',
        cardholderName: 'Ada Lovelace',
        lastFourDigits: '4242',
        brand: 'VISA',
        expiryMonth: 1,
        expiryYear: 2020,
        token: CardToken.create('tok_visa_4242'),
        now,
      }),
    ).toThrow(InvalidCardError);
  });

  it('deactivates an active card', () => {
    const card = Card.create({
      id: '22222222-2222-4222-8222-222222222222',
      userId: '11111111-1111-4111-8111-111111111111',
      cardholderName: 'Ada Lovelace',
      lastFourDigits: '4242',
      brand: 'VISA',
      expiryMonth: 12,
      expiryYear: 2030,
      token: CardToken.create('tok_visa_4242'),
      now,
    });

    expect(card.deactivate().isActive).toBe(false);
  });
});
