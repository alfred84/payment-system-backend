import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import type winston from 'winston';

/**
 * Attach a correlation id and log request completion.
 *
 * @param logger - Winston logger instance.
 * @returns Express middleware.
 */
export function createRequestLogger(logger: winston.Logger) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const requestId = req.header('x-request-id') ?? randomUUID();
    req.requestId = requestId;
    res.setHeader('X-Request-Id', requestId);

    const startedAt = Date.now();
    res.on('finish', () => {
      logger.info('http request', {
        requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt,
      });
    });

    next();
  };
}
