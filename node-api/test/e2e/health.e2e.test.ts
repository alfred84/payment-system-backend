import { createTestHttpContext } from '../helpers/httpAgent';

describe('GET /health (e2e)', () => {
  const { request } = createTestHttpContext();

  it('returns 200 with status ok', async () => {
    const res = await request.get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: 'ok',
      service: 'payment-system-node-api',
    });
    expect(res.body.timestamp).toBeDefined();
  });
});
