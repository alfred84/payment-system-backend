import { PrismaClient } from '@prisma/client';

/**
 * Create a Prisma client (optionally targeting a specific database URL).
 *
 * @param databaseUrl - Override connection string (e.g. integration test DB).
 * @returns Configured Prisma client instance.
 */
export function createPrismaClient(databaseUrl?: string): PrismaClient {
  if (databaseUrl) {
    return new PrismaClient({
      datasources: { db: { url: databaseUrl } },
    });
  }
  return new PrismaClient();
}
