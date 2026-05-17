import { createTestHttpContext } from '../helpers/httpAgent';
import { buildCardPayload, buildUserPayload } from '../helpers/builders';
import { mockProcessorApproved } from '../helpers/e2eProcessor';
import { loadEnv } from '../../src/shared/config/env';

describe('Cards API (e2e)', () => {
  const env = loadEnv();
  let http: ReturnType<typeof createTestHttpContext>;

  beforeEach(() => {
    http = createTestHttpContext();
  });

  async function createUser() {
    const res = await http.request.post('/api/v1/users').send(buildUserPayload());
    expect(res.status).toBe(201);
    return { userId: res.body.id as string };
  }

  it('registers a card and lists only owned cards', async () => {
    const { userId } = await createUser();
    mockProcessorApproved(env);

    const created = await http.request
      .post('/api/v1/cards')
      .send({ ...buildCardPayload(), userId });
    expect(created.status).toBe(201);
    expect(created.body.last4).toBe('4242');

    const list = await http.request.get(`/api/v1/cards?user_id=${userId}`);
    expect(list.status).toBe(200);
    expect(list.body.count).toBe(1);
    expect(list.body.data[0].id).toBe(created.body.id);
  });

  it('rejects expired cards with 422', async () => {
    const { userId } = await createUser();
    const res = await http.request.post('/api/v1/cards').send({
      ...buildCardPayload(),
      userId,
      expiryMonth: 1,
      expiryYear: 2020,
    });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 422 when user_id is missing from card registration', async () => {
    const res = await http.request.post('/api/v1/cards').send(buildCardPayload());
    expect(res.status).toBe(422);
  });

  it('soft-deletes a card and returns 204', async () => {
    const { userId } = await createUser();
    mockProcessorApproved(env);

    const created = await http.request
      .post('/api/v1/cards')
      .send({ ...buildCardPayload(), userId });
    expect(created.status).toBe(201);

    const deleted = await http.request.delete(`/api/v1/cards/${created.body.id}?user_id=${userId}`);
    expect(deleted.status).toBe(204);

    const list = await http.request.get(`/api/v1/cards?user_id=${userId}`);
    expect(list.body.count).toBe(0);
  });

  it('returns 404 when soft-deleting another users card', async () => {
    const userA = await createUser();
    const userB = await createUser();
    mockProcessorApproved(env);

    const created = await http.request
      .post('/api/v1/cards')
      .send({ ...buildCardPayload(), userId: userA.userId });
    expect(created.status).toBe(201);

    const deleted = await http.request.delete(
      `/api/v1/cards/${created.body.id}?user_id=${userB.userId}`,
    );
    expect(deleted.status).toBe(404);
    expect(deleted.body.error.code).toBe('NOT_FOUND');
  });
});
