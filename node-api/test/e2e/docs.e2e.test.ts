import { createTestHttpContext } from '../helpers/httpAgent';

describe('API docs (e2e)', () => {
  const { request } = createTestHttpContext();

  it('serves Swagger UI HTML', async () => {
    const res = await request.get('/api/v1/docs/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('swagger');
  });

  it('serves OpenAPI 3.0 JSON with documented paths', async () => {
    const res = await request.get('/api/v1/docs/openapi.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toMatch(/^3\.0/);

    const requiredPaths = [
      '/auth/register',
      '/auth/login',
      '/auth/refresh',
      '/auth/logout',
      '/cards',
      '/cards/{id}',
      '/payments',
      '/payments/{id}',
    ];

    for (const path of requiredPaths) {
      expect(res.body.paths[path]).toBeDefined();
    }
  });
});
