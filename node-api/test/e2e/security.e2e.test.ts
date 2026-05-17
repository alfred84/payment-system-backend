import { createTestHttpContext } from '../helpers/httpAgent';
import { buildRegisterPayload, STRONG_PASSWORD } from '../helpers/builders';

describe('Security (e2e)', () => {
  let http: ReturnType<typeof createTestHttpContext>;

  beforeEach(() => {
    http = createTestHttpContext();
  });

  it('rejects SQL injection patterns in email with 422', async () => {
    const res = await http.request.post('/api/v1/auth/register').send({
      fullName: 'Test User',
      email: "ada' OR 1=1 --@example.com",
      password: STRONG_PASSWORD,
    });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.stack).toBeUndefined();
    expect(res.body.error.stack).toBeUndefined();
  });

  it('does not expose stack traces in error responses', async () => {
    const payload = buildRegisterPayload();
    const res = await http.request.post('/api/v1/auth/login').send({
      email: payload.email,
      password: 'WrongPass1!',
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
    expect(res.body.stack).toBeUndefined();
    expect(res.body.error.stack).toBeUndefined();
  });
});
