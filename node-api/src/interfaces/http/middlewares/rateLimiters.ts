import type { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

import { ErrorCode } from '../../../shared/errors/ErrorCode';

function rateLimitHandler(_req: Request, res: Response): void {
  const requestId = _req.requestId ?? 'unknown';
  res.setHeader('Retry-After', '900');
  res.status(429).json({
    error: {
      code: ErrorCode.RATE_LIMITED,
      message: 'Too many requests',
      requestId,
    },
  });
}

/** Register: 10 requests per IP per 15 minutes. */
export function createRegisterLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
  });
}

/** Login: 5 requests per IP per 15 minutes (OWASP A07). */
export function createLoginLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
  });
}

/** Refresh: 30 requests per IP per 15 minutes. */
export function createRefreshLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
  });
}
