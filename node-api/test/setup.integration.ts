import { execSync } from 'node:child_process';
import path from 'node:path';

import dotenv from 'dotenv';
import nock from 'nock';

import {
  createTestPrismaClient,
  getTestDatabaseUrl,
  truncateAllTables,
} from './helpers/integrationDb';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.example') });

const prisma = createTestPrismaClient();

beforeAll(() => {
  process.env.NODE_ENV = 'test';
  const testDbUrl = getTestDatabaseUrl();
  execSync('npx prisma migrate deploy', {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, DATABASE_URL: testDbUrl },
    stdio: 'pipe',
  });
});

beforeEach(async () => {
  nock.cleanAll();
  await truncateAllTables(prisma);
});

afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };
