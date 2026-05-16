import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';

import { createTestHttpContext } from '../helpers/httpAgent';
import { buildRegisterPayload } from '../helpers/builders';

describe('Auth API (e2e)', () => {
  let http: ReturnType<typeof createTestHttpContext>;

  beforeEach(() => {
    http = createTestHttpContext();
  });

  async function registerUser() {
    const payload = buildRegisterPayload();
    const res = await http.request.post('/api/v1/auth/register').send(payload);
    expect(res.status).toBe(201);
    return { payload, body: res.body };
  }

  it('registers, logs in, refreshes, and logs out', async () => {
    const { payload, body: registered } = await registerUser();

    const login = await http.request.post('/api/v1/auth/login').send({
      email: payload.email,
      password: payload.password,
    });
    expect(login.status).toBe(200);
    expect(login.body.accessToken).toBeDefined();

    const refreshed = await http.request.post('/api/v1/auth/refresh').send({
      refreshToken: login.body.refreshToken,
    });
    expect(refreshed.status).toBe(200);
    expect(refreshed.body.refreshToken).not.toBe(login.body.refreshToken);

    const logout = await http.request
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${refreshed.body.accessToken}`)
      .send({ refreshToken: refreshed.body.refreshToken });
    expect(logout.status).toBe(204);
    expect(registered.user.id).toBeDefined();
  });

  it('returns 401 for invalid credentials', async () => {
    const { payload } = await registerUser();
    const res = await http.request.post('/api/v1/auth/login').send({
      email: payload.email,
      password: 'WrongPass1!',
    });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rate limits login after five attempts', async () => {
    const { payload } = await registerUser();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const res = await http.request.post('/api/v1/auth/login').send({
        email: payload.email,
        password: 'WrongPass1!',
      });
      expect(res.status).toBe(401);
    }

    const blocked = await http.request.post('/api/v1/auth/login').send({
      email: payload.email,
      password: 'WrongPass1!',
    });
    expect(blocked.status).toBe(429);
    expect(blocked.body.error.code).toBe('RATE_LIMITED');
  });

  it('revokes the refresh token family on reuse', async () => {
    const { payload } = await registerUser();
    const login = await http.request.post('/api/v1/auth/login').send({
      email: payload.email,
      password: payload.password,
    });
    const firstRefresh = login.body.refreshToken;

    const rotated = await http.request.post('/api/v1/auth/refresh').send({
      refreshToken: firstRefresh,
    });
    expect(rotated.status).toBe(200);

    const reuse = await http.request.post('/api/v1/auth/refresh').send({
      refreshToken: firstRefresh,
    });
    expect(reuse.status).toBe(401);
    expect(reuse.body.error.code).toBe('UNAUTHORIZED');

    const rotatedAlsoBlocked = await http.request.post('/api/v1/auth/refresh').send({
      refreshToken: rotated.body.refreshToken,
    });
    expect(rotatedAlsoBlocked.status).toBe(401);
  });

  it('returns 401 when authorization is missing', async () => {
    const res = await http.request.post('/api/v1/auth/logout').send({ refreshToken: 'x' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects tokens signed with the wrong secret', async () => {
    const { body } = await registerUser();
    const badToken = jwt.sign({ email: body.user.email }, 'wrong-secret-wrong-secret-wrong!!', {
      subject: body.user.id,
      algorithm: 'HS256',
    });

    const res = await http.request
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${badToken}`)
      .send({ refreshToken: body.refreshToken });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects alg none tokens', async () => {
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({ sub: randomUUID(), email: 'x@example.com' }),
    ).toString('base64url');
    const token = `${header}.${payload}.`;

    const res = await http.request
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .send({ refreshToken: 'x' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});
