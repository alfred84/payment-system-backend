import { createTestHttpContext } from '../helpers/httpAgent';
import { buildCardPayload, buildRegisterPayload } from '../helpers/builders';

describe('Cards API (e2e)', () => {
  let http: ReturnType<typeof createTestHttpContext>;

  beforeEach(() => {
    http = createTestHttpContext();
  });

  async function authHeader() {
    const payload = buildRegisterPayload();
    const registered = await http.request.post('/api/v1/auth/register').send(payload);
    return {
      authorization: `Bearer ${registered.body.accessToken}`,
      userId: registered.body.user.id,
    };
  }

  it('registers a card and lists only owned cards', async () => {
    const { authorization } = await authHeader();
    const cardPayload = buildCardPayload();

    const created = await http.request
      .post('/api/v1/cards')
      .set('Authorization', authorization)
      .send(cardPayload);
    expect(created.status).toBe(201);
    expect(created.body.last4).toBe('4242');

    const list = await http.request.get('/api/v1/cards').set('Authorization', authorization);
    expect(list.status).toBe(200);
    expect(list.body.count).toBe(1);
    expect(list.body.data[0].id).toBe(created.body.id);
  });

  it('rejects expired cards with 422', async () => {
    const { authorization } = await authHeader();
    const res = await http.request
      .post('/api/v1/cards')
      .set('Authorization', authorization)
      .send({
        ...buildCardPayload(),
        expiryMonth: 1,
        expiryYear: 2020,
      });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 404 when deleting another users card', async () => {
    const userA = await authHeader();
    const created = await http.request
      .post('/api/v1/cards')
      .set('Authorization', userA.authorization)
      .send(buildCardPayload());
    expect(created.status).toBe(201);

    const userB = await authHeader();
    const deleted = await http.request
      .delete(`/api/v1/cards/${created.body.id}`)
      .set('Authorization', userB.authorization);
    expect(deleted.status).toBe(404);
    expect(deleted.body.error.code).toBe('NOT_FOUND');
  });
});
