import { createTestHttpContext } from '../helpers/httpAgent';
import { buildUserPayload } from '../helpers/builders';

describe('Users API (e2e)', () => {
  let http: ReturnType<typeof createTestHttpContext>;

  beforeEach(() => {
    http = createTestHttpContext();
  });

  it('creates a user and returns 201', async () => {
    const payload = buildUserPayload();
    const res = await http.request.post('/api/v1/users').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.email).toBe(payload.email);
    expect(res.body.fullName).toBe(payload.fullName);
    expect(res.body.createdAt).toBeDefined();
  });

  it('returns 409 when email is already registered', async () => {
    const payload = buildUserPayload();
    await http.request.post('/api/v1/users').send(payload);
    const second = await http.request.post('/api/v1/users').send(payload);
    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe('CONFLICT');
  });

  it('returns 422 for invalid email', async () => {
    const res = await http.request
      .post('/api/v1/users')
      .send({ fullName: 'Test', email: 'not-an-email' });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('lists all users', async () => {
    const payload = buildUserPayload();
    await http.request.post('/api/v1/users').send(payload);
    const res = await http.request.get('/api/v1/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.count).toBeGreaterThanOrEqual(1);
  });

  it('gets a user by id', async () => {
    const payload = buildUserPayload();
    const created = await http.request.post('/api/v1/users').send(payload);
    const userId = created.body.id as string;

    const res = await http.request.get(`/api/v1/users/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(userId);
    expect(res.body.email).toBe(payload.email);
  });

  it('returns 404 for unknown user id', async () => {
    const res = await http.request.get(
      '/api/v1/users/99999999-9999-4999-8999-999999999999',
    );
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
