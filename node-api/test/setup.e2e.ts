import { execSync } from 'node:child_process';
import path from 'node:path';

import dotenv from 'dotenv';
import nock from 'nock';

import {
  createTestPrismaClient,
  getTestDatabaseUrl,
  truncateAllTables,
} from './helpers/integrationDb';
import {
  assertProcessorHealthy,
  configureLiveProcessorE2eEnv,
  getLiveProcessorUrl,
  isLiveProcessorE2e,
} from './helpers/e2eProcessor';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.example') });

configureLiveProcessorE2eEnv();

jest.setTimeout(120_000);

const prisma = createTestPrismaClient();
let liveProcessorHealthVerified = false;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  const testDbUrl = getTestDatabaseUrl();
  process.env.DATABASE_URL = testDbUrl;
  execSync('npx prisma migrate deploy', {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, DATABASE_URL: testDbUrl },
    stdio: 'pipe',
  });

  if (isLiveProcessorE2e() && !liveProcessorHealthVerified) {
    await assertProcessorHealthy(getLiveProcessorUrl());
    liveProcessorHealthVerified = true;
  }
});

beforeEach(async () => {
  if (!isLiveProcessorE2e()) {
    nock.cleanAll();
  }
  await truncateAllTables(prisma);
});

afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };
