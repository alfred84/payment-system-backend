import { createTestHttpContext } from '../helpers/httpAgent';

describe('Security (e2e)', () => {
  let http: ReturnType<typeof createTestHttpContext>;

  beforeEach(() => {
    http = createTestHttpContext();
  });

  it('rejects SQL injection patterns in email with 422', async () => {
    const res = await http.request.post('/api/v1/users').send({
      fullName: 'Test User',
      email: "ada' OR 1=1 --@example.com",
    });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.stack).toBeUndefined();
    expect(res.body.error.stack).toBeUndefined();
  });

  it('does not expose stack traces on 404 responses', async () => {
    const res = await http.request.get(
      '/api/v1/users/99999999-9999-4999-8999-999999999999',
    );

    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
    expect(res.body.stack).toBeUndefined();
    expect(res.body.error.stack).toBeUndefined();
  });
});
