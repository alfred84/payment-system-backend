import { Card } from '../../domain/card/Card';
import { Email } from '../../domain/shared/value-objects/Email';
import { CardToken } from '../../domain/shared/value-objects/CardToken';
import { User } from '../../domain/user/User';
import { prisma } from '../../../test/setup.integration';
import { PrismaCardRepository } from './PrismaCardRepository';
import { PrismaUserRepository } from './PrismaUserRepository';

describe('PrismaCardRepository (integration)', () => {
  const userRepository = new PrismaUserRepository(prisma);
  const cardRepository = new PrismaCardRepository(prisma);
  const now = new Date('2026-05-16T12:00:00.000Z');
  const userId = '11111111-1111-4111-8111-111111111111';

  beforeEach(async () => {
    await userRepository.save(
      User.create({
        id: userId,
        fullName: 'Ada Lovelace',
        email: Email.create('ada@example.com'),
        now,
      }),
    );
  });

  it('soft-deletes a card while keeping the row', async () => {
    const card = Card.create({
      id: '22222222-2222-4222-8222-222222222222',
      userId,
      cardholderName: 'Ada Lovelace',
      lastFourDigits: '4242',
      brand: 'VISA',
      expiryMonth: 12,
      expiryYear: 2030,
      token: CardToken.create('tok_abc'),
      now,
    });
    await cardRepository.save(card);

    await cardRepository.save(card.deactivate());

    const row = await prisma.card.findUnique({ where: { id: card.id } });
    expect(row?.isActive).toBe(false);

    const active = await cardRepository.findActiveByUserId(userId);
    expect(active).toHaveLength(0);

    const found = await cardRepository.findById(card.id, userId);
    expect(found?.isActive).toBe(false);
  });
});
