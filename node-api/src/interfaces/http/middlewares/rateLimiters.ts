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

/** General API: 100 requests per IP per 15 minutes. */
export function createApiLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
  });
}
