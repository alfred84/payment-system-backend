import type { NextFunction, Request, Response } from 'express';
import type winston from 'winston';

import { mapDomainErrorToHttp } from '../../../shared/errors/mapDomainErrorToHttp';

/**
 * Map errors to the public API error envelope.
 *
 * @param logger - Winston logger instance.
 * @returns Express error-handling middleware.
 */
export function createErrorMapper(logger: winston.Logger) {
  return (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
    const httpError = mapDomainErrorToHttp(err);

    if (httpError.statusCode >= 500) {
      logger.error('unhandled error', {
        requestId: req.requestId,
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      });
    }

    const body: {
      error: {
        code: string;
        message: string;
        requestId: string;
        details?: { field: string; issue: string }[];
      };
    } = {
      error: {
        code: httpError.code,
        message: httpError.message,
        requestId: req.requestId ?? 'unknown',
      },
    };

    if (httpError.details.length > 0) {
      body.error.details = httpError.details;
    }

    res.status(httpError.statusCode).json(body);
  };
}
