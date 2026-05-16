import type { NextFunction, Request, Response } from 'express';

import { IdempotencyKey } from '../../../domain/shared/value-objects/IdempotencyKey';
import { ErrorCode } from '../../../shared/errors/ErrorCode';
import { HttpError } from '../../../shared/errors/HttpError';
import { mapDomainErrorToHttp } from '../../../shared/errors/mapDomainErrorToHttp';

/**
 * Require a valid UUID v4 `Idempotency-Key` header on payment creation.
 *
 * @returns Express middleware.
 */
export function requireIdempotencyKey(req: Request, _res: Response, next: NextFunction): void {
  const raw = req.header('Idempotency-Key');
  if (!raw?.trim()) {
    next(new HttpError(400, ErrorCode.VALIDATION_ERROR, 'Idempotency-Key header is required'));
    return;
  }

  try {
    req.idempotencyKey = IdempotencyKey.create(raw.trim());
    next();
  } catch (error) {
    next(mapDomainErrorToHttp(error));
  }
}
