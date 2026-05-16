import request from 'supertest';
import { loadEnv } from '../../src/shared/config/env';
import { createLogger } from '../../src/shared/logger/winstonLogger';
import { createApp } from '../../src/interfaces/http/app';

describe('GET /health (e2e)', () => {
  const env = loadEnv();
  const app = createApp({ env, logger: createLogger('error') });

  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: 'ok',
      service: 'payment-system-node-api',
    });
    expect(res.body.timestamp).toBeDefined();
  });
});
