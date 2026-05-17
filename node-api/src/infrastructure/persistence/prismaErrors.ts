import { Prisma } from '@prisma/client';

/**
 * Whether a Prisma error is a unique violation on the per-user idempotency key.
 *
 * @param error - Caught persistence error.
 * @returns True when the payments idempotency unique index was violated.
 */
export function isPaymentIdempotencyUniqueViolation(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false;
  }
  if (error.code !== 'P2002') {
    return false;
  }

  const target = error.meta?.target;
  if (Array.isArray(target)) {
    return target.includes('idempotencyKey') || target.includes('user_id');
  }
  if (typeof target === 'string') {
    return target.includes('idempotency') || target.includes('payments_idem');
  }
  return false;
}
