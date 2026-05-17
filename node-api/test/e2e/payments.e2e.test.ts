import { randomUUID } from 'node:crypto';
import nock from 'nock';

import { loadEnv } from '../../src/shared/config/env';
import { createTestHttpContext } from '../helpers/httpAgent';
import { buildCardPayload, buildRegisterPayload } from '../helpers/builders';
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
    const payload = buildRegisterPayload();
    const registered = await http.request.post('/api/v1/auth/register').send(payload);
    const authorization = `Bearer ${registered.body.accessToken}`;

    mockProcessorApproved(env);

    const card = await http.request
      .post('/api/v1/cards')
      .set('Authorization', authorization)
      .send(buildCardPayload());

    return { authorization, cardId: card.body.id };
  }

  it('returns 400 when Idempotency-Key is missing', async () => {
    const { authorization, cardId } = await setupUserWithCard();
    const res = await http.request
      .post('/api/v1/payments')
      .set('Authorization', authorization)
      .send({ cardId, amount: 10.5, currency: 'USD' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns the same payment for duplicate idempotency keys', async () => {
    const { authorization, cardId } = await setupUserWithCard();
    const idempotencyKey = randomUUID();
    const body = { cardId, amount: 25.5, currency: 'USD' };

    const first = await http.request
      .post('/api/v1/payments')
      .set('Authorization', authorization)
      .set('Idempotency-Key', idempotencyKey)
      .send(body);
    expect(first.status).toBe(201);

    const second = await http.request
      .post('/api/v1/payments')
      .set('Authorization', authorization)
      .set('Idempotency-Key', idempotencyKey)
      .send(body);
    expect(second.status).toBe(201);
    expect(second.body.id).toBe(first.body.id);
  });

  it('returns 409 when the same key is reused with a different body', async () => {
    const { authorization, cardId } = await setupUserWithCard();
    const idempotencyKey = randomUUID();

    const first = await http.request
      .post('/api/v1/payments')
      .set('Authorization', authorization)
      .set('Idempotency-Key', idempotencyKey)
      .send({ cardId, amount: 10, currency: 'USD' });
    expect(first.status).toBe(201);

    const conflict = await http.request
      .post('/api/v1/payments')
      .set('Authorization', authorization)
      .set('Idempotency-Key', idempotencyKey)
      .send({ cardId, amount: 20, currency: 'USD' });
    expect(conflict.status).toBe(409);
    expect(conflict.body.error.code).toBe('IDEMPOTENCY_CONFLICT');
  });

  it('returns REJECTED status when the processor declines', async () => {
    const { authorization, cardId } = await setupUserWithCard();

    if (isLiveProcessorE2e()) {
      let rejected: { status: number; body: { status: string } } | null = null;
      for (let attempt = 0; attempt < 40; attempt += 1) {
        const attemptRes = await http.request
          .post('/api/v1/payments')
          .set('Authorization', authorization)
          .set('Idempotency-Key', randomUUID())
          .send({ cardId, amount: 15, currency: 'USD' });
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
      .set('Authorization', authorization)
      .set('Idempotency-Key', randomUUID())
      .send({ cardId, amount: 15, currency: 'USD' });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('REJECTED');
  });

  it('returns 404 for cross-user payment access', async () => {
    const owner = await setupUserWithCard();
    const payment = await http.request
      .post('/api/v1/payments')
      .set('Authorization', owner.authorization)
      .set('Idempotency-Key', randomUUID())
      .send({ cardId: owner.cardId, amount: 12, currency: 'USD' });
    expect(payment.status).toBe(201);

    const otherPayload = buildRegisterPayload();
    const other = await http.request.post('/api/v1/auth/register').send(otherPayload);

    const forbidden = await http.request
      .get(`/api/v1/payments/${payment.body.id}`)
      .set('Authorization', `Bearer ${other.body.accessToken}`);
    expect(forbidden.status).toBe(404);
    expect(forbidden.body.error.code).toBe('NOT_FOUND');
  });
});
