import { randomUUID } from 'node:crypto';
import nock from 'nock';

import { loadEnv } from '../../src/shared/config/env';
import { createTestHttpContext } from '../helpers/httpAgent';
import { buildCardPayload, buildUserPayload } from '../helpers/builders';
import {
  isLiveProcessorE2e,
  mockProcessorApproved,
  mockProcessorDeclined,
} from '../helpers/e2eProcessor';

describe('Payments API (e2e)', () => {
  const env = loadEnv();
  let http: ReturnType<typeof createTestHttpContext>;

  beforeEach(() => {
    http = createTestHttpContext();
  });

  async function setupUserWithCard() {
    const userRes = await http.request.post('/api/v1/users').send(buildUserPayload());
    expect(userRes.status).toBe(201);
    const userId = userRes.body.id as string;

    mockProcessorApproved(env);

    const cardRes = await http.request
      .post('/api/v1/cards')
      .send({ ...buildCardPayload(), userId });
    expect(cardRes.status).toBe(201);

    return { userId, cardId: cardRes.body.id as string };
  }

  it('returns 400 when Idempotency-Key is missing', async () => {
    const { userId, cardId } = await setupUserWithCard();
    const res = await http.request
      .post('/api/v1/payments')
      .send({ userId, cardId, amount: 10.5, currency: 'USD' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 422 when user_id is missing from payment body', async () => {
    const res = await http.request
      .post('/api/v1/payments')
      .set('Idempotency-Key', randomUUID())
      .send({ cardId: '22222222-2222-4222-8222-222222222222', amount: 10, currency: 'USD' });
    expect(res.status).toBe(422);
  });

  it('returns the same payment for duplicate idempotency keys', async () => {
    const { userId, cardId } = await setupUserWithCard();
    const idempotencyKey = randomUUID();
    const body = { userId, cardId, amount: 25.5, currency: 'USD' };

    mockProcessorApproved(env);
    const first = await http.request
      .post('/api/v1/payments')
      .set('Idempotency-Key', idempotencyKey)
      .send(body);
    expect(first.status).toBe(201);

    const second = await http.request
      .post('/api/v1/payments')
      .set('Idempotency-Key', idempotencyKey)
      .send(body);
    expect(second.status).toBe(201);
    expect(second.body.id).toBe(first.body.id);
  });

  it('returns 409 when the same key is reused with a different body', async () => {
    const { userId, cardId } = await setupUserWithCard();
    const idempotencyKey = randomUUID();

    mockProcessorApproved(env);
    const first = await http.request
      .post('/api/v1/payments')
      .set('Idempotency-Key', idempotencyKey)
      .send({ userId, cardId, amount: 10, currency: 'USD' });
    expect(first.status).toBe(201);

    const conflict = await http.request
      .post('/api/v1/payments')
      .set('Idempotency-Key', idempotencyKey)
      .send({ userId, cardId, amount: 20, currency: 'USD' });
    expect(conflict.status).toBe(409);
    expect(conflict.body.error.code).toBe('IDEMPOTENCY_CONFLICT');
  });

  it('returns REJECTED status when the processor declines', async () => {
    const { userId, cardId } = await setupUserWithCard();

    if (isLiveProcessorE2e()) {
      let rejected: { status: number; body: { status: string } } | null = null;
      for (let attempt = 0; attempt < 40; attempt += 1) {
        const attemptRes = await http.request
          .post('/api/v1/payments')
          .set('Idempotency-Key', randomUUID())
          .send({ userId, cardId, amount: 15, currency: 'USD' });
        expect(attemptRes.status).toBe(201);
        if (attemptRes.body.status === 'REJECTED') {
          rejected = attemptRes;
          break;
        }
      }
      expect(rejected).not.toBeNull();
      expect(rejected?.body.status).toBe('REJECTED');
      return;
    }

    nock.cleanAll();
    mockProcessorDeclined(env);

    const res = await http.request
      .post('/api/v1/payments')
      .set('Idempotency-Key', randomUUID())
      .send({ userId, cardId, amount: 15, currency: 'USD' });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('REJECTED');
  });

  it('lists payments for the user', async () => {
    const { userId, cardId } = await setupUserWithCard();
    mockProcessorApproved(env);

    const payment = await http.request
      .post('/api/v1/payments')
      .set('Idempotency-Key', randomUUID())
      .send({ userId, cardId, amount: 12, currency: 'USD' });
    expect(payment.status).toBe(201);

    const list = await http.request.get(`/api/v1/payments?user_id=${userId}`);
    expect(list.status).toBe(200);
    expect(list.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('returns 404 for cross-user payment access', async () => {
    const owner = await setupUserWithCard();
    mockProcessorApproved(env);

    const payment = await http.request
      .post('/api/v1/payments')
      .set('Idempotency-Key', randomUUID())
      .send({ userId: owner.userId, cardId: owner.cardId, amount: 12, currency: 'USD' });
    expect(payment.status).toBe(201);

    const otherUserRes = await http.request.post('/api/v1/users').send(buildUserPayload());
    const otherUserId = otherUserRes.body.id as string;

    const forbidden = await http.request.get(
      `/api/v1/payments/${payment.body.id}?user_id=${otherUserId}`,
    );
    expect(forbidden.status).toBe(404);
    expect(forbidden.body.error.code).toBe('NOT_FOUND');
  });
});
