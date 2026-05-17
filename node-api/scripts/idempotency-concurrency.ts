/**
 * Phase 6 — spawn concurrent payment creates with the same idempotency key.
 * Expect exactly one payment row in the database.
 *
 * Usage (from node-api/, with e2e stack running):
 *   npm run test:idempotency-concurrency
 */

import { randomUUID } from 'node:crypto';
import { loadEnv } from '../src/shared/config/env';
import { createContainer } from '../src/infrastructure/di/container';
import { toAppDependencies } from '../src/interfaces/http/containerAdapter';
import { createApp } from '../src/interfaces/http/app';
import { getTestDatabaseUrl } from '../test/helpers/integrationDb';
import { buildCardPayload, buildRegisterPayload } from '../test/helpers/builders';
import request from 'supertest';

const CONCURRENT_REQUESTS = 50;

async function main(): Promise<void> {
  process.env.NODE_ENV = 'test';
  process.env.E2E_LIVE_PROCESSOR = '1';
  process.env.PROCESSOR_URL = process.env.E2E_PROCESSOR_URL ?? 'http://localhost:9000';
  process.env.DATABASE_URL = getTestDatabaseUrl();

  const env = loadEnv();
  const container = createContainer({ databaseUrl: getTestDatabaseUrl() });
  const app = createApp(toAppDependencies(container));
  const agent = request(app);

  const registerPayload = buildRegisterPayload();
  const registered = await agent.post('/api/v1/auth/register').send(registerPayload);
  if (registered.status !== 201) {
    throw new Error(`Register failed with status ${registered.status}`);
  }

  const authorization = `Bearer ${registered.body.accessToken as string}`;
  const card = await agent
    .post('/api/v1/cards')
    .set('Authorization', authorization)
    .send(buildCardPayload());
  if (card.status !== 201) {
    throw new Error(`Card registration failed with status ${card.status}`);
  }

  const cardId = card.body.id as string;
  const idempotencyKey = randomUUID();
  const body = { cardId, amount: 42.5, currency: 'USD' };

  const responses = await Promise.all(
    Array.from({ length: CONCURRENT_REQUESTS }, () =>
      agent
        .post('/api/v1/payments')
        .set('Authorization', authorization)
        .set('Idempotency-Key', idempotencyKey)
        .send(body),
    ),
  );

  const paymentIds = new Set(
    responses.filter((res) => res.status === 201).map((res) => res.body.id as string),
  );

  if (paymentIds.size !== 1) {
    throw new Error(
      `Expected exactly one distinct payment id, got ${paymentIds.size} (statuses: ${responses.map((r) => r.status).join(', ')})`,
    );
  }

  const prisma = (
    await import('../test/helpers/integrationDb')
  ).createTestPrismaClient();
  const rowCount = await prisma.payment.count({
    where: { idempotencyKey },
  });
  await prisma.$disconnect();

  if (rowCount !== 1) {
    throw new Error(`Expected 1 payment row for idempotency key, found ${rowCount}`);
  }

  process.stdout.write(
    `Idempotency concurrency OK: ${CONCURRENT_REQUESTS} requests, 1 payment row, processor=${env.PROCESSOR_URL}\n`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Idempotency concurrency check failed: ${message}\n`);
  process.exit(1);
});
