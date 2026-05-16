import { Card } from '../../domain/card/Card';
import { Payment } from '../../domain/payment/Payment';
import { Email } from '../../domain/shared/value-objects/Email';
import { CardToken } from '../../domain/shared/value-objects/CardToken';
import { Currency } from '../../domain/shared/value-objects/Currency';
import { IdempotencyKey } from '../../domain/shared/value-objects/IdempotencyKey';
import { User } from '../../domain/user/User';
import { prisma } from '../../../test/setup.integration';
import { PrismaCardRepository } from './PrismaCardRepository';
import { PrismaPaymentRepository } from './PrismaPaymentRepository';
import { PrismaUserRepository } from './PrismaUserRepository';

describe('PrismaPaymentRepository (integration)', () => {
  const userRepository = new PrismaUserRepository(prisma);
  const cardRepository = new PrismaCardRepository(prisma);
  const paymentRepository = new PrismaPaymentRepository(prisma);
  const now = new Date('2026-05-16T12:00:00.000Z');
  const userId = '11111111-1111-4111-8111-111111111111';
  const cardId = '22222222-2222-4222-8222-222222222222';
  const idempotencyKey = IdempotencyKey.create('8f5b3c2a-1d4e-4a9b-9c3d-2e1f0a9b8c7d');

  beforeEach(async () => {
    await userRepository.save(
      User.register({
        id: userId,
        fullName: 'Ada Lovelace',
        email: Email.create('ada@example.com'),
        passwordHash: '$2b$12$hashed',
        now,
      }),
    );
    await cardRepository.save(
      Card.create({
        id: cardId,
        userId,
        cardholderName: 'Ada Lovelace',
        lastFourDigits: '4242',
        brand: 'VISA',
        expiryMonth: 12,
        expiryYear: 2030,
        token: CardToken.create('tok_abc'),
        now,
      }),
    );
  });

  it('writes audit log when status transitions in update', async () => {
    const pending = Payment.create({
      id: '33333333-3333-4333-8333-333333333333',
      userId,
      cardId,
      amount: 19.99,
      currency: Currency.create('USD'),
      idempotencyKey,
      now,
    });
    await paymentRepository.save(pending);

    const approved = pending.markApproved('44444444-4444-4444-8444-444444444444', 'Approved', now);
    await paymentRepository.update(approved);

    const auditRows = await prisma.paymentAuditLog.findMany({
      where: { paymentId: pending.id },
    });
    expect(auditRows).toHaveLength(1);
    expect(auditRows[0]?.fromStatus).toBe('PENDING');
    expect(auditRows[0]?.toStatus).toBe('APPROVED');
  });

  it('finds payment by idempotency key within the lookup window', async () => {
    const payment = Payment.create({
      id: '33333333-3333-4333-8333-333333333333',
      userId,
      cardId,
      amount: 15,
      currency: Currency.create('USD'),
      idempotencyKey,
      now,
    });
    await paymentRepository.save(payment);

    const windowStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const found = await paymentRepository.findByIdempotencyKey(userId, idempotencyKey, windowStart);
    expect(found?.id).toBe(payment.id);

    const byId = await paymentRepository.findById(payment.id, userId);
    expect(byId?.status).toBe('PENDING');
  });

  it('enforces idempotency key uniqueness per user', async () => {
    const first = Payment.create({
      id: '33333333-3333-4333-8333-333333333333',
      userId,
      cardId,
      amount: 10,
      currency: Currency.create('USD'),
      idempotencyKey,
      now,
    });
    const second = Payment.create({
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      userId,
      cardId,
      amount: 20,
      currency: Currency.create('USD'),
      idempotencyKey,
      now,
    });

    await paymentRepository.save(first);
    await expect(paymentRepository.save(second)).rejects.toThrow();
  });

  it('lists payments with keyset pagination', async () => {
    const older = Payment.create({
      id: '33333333-3333-4333-8333-333333333333',
      userId,
      cardId,
      amount: 10,
      currency: Currency.create('USD'),
      idempotencyKey: IdempotencyKey.create('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
      now: new Date('2026-05-15T12:00:00.000Z'),
    });
    const newer = Payment.create({
      id: '44444444-4444-4444-8444-444444444444',
      userId,
      cardId,
      amount: 20,
      currency: Currency.create('USD'),
      idempotencyKey: IdempotencyKey.create('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),
      now: new Date('2026-05-16T12:00:00.000Z'),
    });
    await paymentRepository.save(older);
    await paymentRepository.save(newer);

    const page = await paymentRepository.listByUser({ userId, limit: 1 });
    expect(page).toHaveLength(1);
    expect(page[0]?.id).toBe(newer.id);

    const cursorPayment = page[0];
    expect(cursorPayment).toBeDefined();
    if (!cursorPayment) {
      throw new Error('Expected a payment in the first pagination page');
    }
    const nextPage = await paymentRepository.listByUser({
      userId,
      limit: 10,
      cursor: { createdAt: cursorPayment.createdAt, id: cursorPayment.id },
    });
    expect(nextPage).toHaveLength(1);
    expect(nextPage[0]?.id).toBe(older.id);
  });
});
