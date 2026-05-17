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
      '/users',
      '/users/{id}',
      '/cards',
      '/cards/{id}',
      '/payments',
      '/payments/{id}',
    ];

    for (const path of requiredPaths) {
      expect(res.body.paths[path]).toBeDefined();
    }
  });

  it('documents request bodies, responses, and shared schemas', async () => {
    const res = await request.get('/api/v1/docs/openapi.json');
    const { paths, components } = res.body;

    expect(components.schemas.UserResponse).toBeDefined();
    expect(components.schemas.CardResponse).toBeDefined();
    expect(components.schemas.PaymentResponse).toBeDefined();
    expect(components.schemas.ApiError).toBeDefined();
    expect(components.parameters.IdempotencyKeyHeader).toBeDefined();

    const createUser = paths['/users'].post;
    expect(createUser.requestBody).toBeDefined();
    expect(createUser.responses['201']).toBeDefined();

    const createPayment = paths['/payments'].post;
    expect(createPayment.requestBody).toBeDefined();
    expect(createPayment.responses['201']).toBeDefined();
    expect(createPayment.responses['409']).toBeDefined();

    const listCards = paths['/cards'].get;
    expect(listCards.responses['200']).toBeDefined();
  });
});
