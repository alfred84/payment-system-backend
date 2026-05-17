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

  it('documents request bodies, responses, bearer auth, and shared schemas', async () => {
    const res = await request.get('/api/v1/docs/openapi.json');
    const { paths, components } = res.body;

    expect(components.securitySchemes.bearerAuth).toMatchObject({
      type: 'http',
      scheme: 'bearer',
    });
    expect(components.schemas.RegisterRequest).toBeDefined();
    expect(components.schemas.PaymentResponse).toBeDefined();
    expect(components.schemas.ApiError).toBeDefined();
    expect(components.parameters.IdempotencyKeyHeader).toBeDefined();

    const register = paths['/auth/register'].post;
    expect(register.requestBody).toBeDefined();
    expect(register.security).toEqual([]);
    expect(register.responses['201']).toBeDefined();

    const login = paths['/auth/login'].post;
    expect(login.requestBody).toBeDefined();
    expect(login.responses['401']).toBeDefined();

    const createPayment = paths['/payments'].post;
    expect(createPayment.security).toEqual([{ bearerAuth: [] }]);
    expect(createPayment.requestBody).toBeDefined();
    expect(createPayment.responses['201']).toBeDefined();
    expect(createPayment.responses['409']).toBeDefined();

    const listCards = paths['/cards'].get;
    expect(listCards.security).toEqual([{ bearerAuth: [] }]);
    expect(listCards.responses['200']).toBeDefined();
  });
});
