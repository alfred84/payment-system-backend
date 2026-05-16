import type { PrismaClient } from '@prisma/client';

import { createPrismaClient } from '../../src/infrastructure/persistence/prismaClient';

/**
 * Resolve the integration-test database URL.
 *
 * @returns Test database connection string.
 * @throws {Error} When DATABASE_URL_TEST is not set.
 */
export function getTestDatabaseUrl(): string {
  const url = process.env.DATABASE_URL_TEST;
  if (!url) {
    throw new Error('DATABASE_URL_TEST is required for integration tests');
  }
  return url;
}

/**
 * Create a Prisma client connected to the test database.
 *
 * @returns Prisma client for integration tests.
 */
export function createTestPrismaClient(): PrismaClient {
  return createPrismaClient(getTestDatabaseUrl());
}

/**
 * Truncate all application tables (dependency order).
 *
 * @param prisma - Prisma client.
 */
export async function truncateAllTables(prisma: PrismaClient): Promise<void> {
  await prisma.$executeRawUnsafe(
    'TRUNCATE payment_audit_log, payments, cards, refresh_tokens, users RESTART IDENTITY CASCADE',
  );
}
