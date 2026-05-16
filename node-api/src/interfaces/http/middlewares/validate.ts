import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodTypeAny } from 'zod';

import { ErrorCode } from '../../../shared/errors/ErrorCode';
import { HttpError } from '../../../shared/errors/HttpError';

export interface ValidateSchemas {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
  headers?: ZodTypeAny;
}

/**
 * Validate request parts with Zod and map failures to {@link HttpError}.
 *
 * @param schemas - Schemas per request segment.
 * @returns Express middleware.
 */
export function validate(schemas: ValidateSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Zod narrows at runtime
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.params) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Zod narrows at runtime
        req.params = schemas.params.parse(req.params);
      }
      if (schemas.query) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Zod narrows at runtime
        req.query = schemas.query.parse(req.query);
      }
      if (schemas.headers) {
        const parsedHeaders = schemas.headers.parse(req.headers) as Record<string, string>;
        req.headers = { ...req.headers, ...parsedHeaders };
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((issue) => ({
          field: issue.path.join('.') || 'body',
          issue: issue.message,
        }));
        next(new HttpError(422, ErrorCode.VALIDATION_ERROR, 'Validation failed', details));
        return;
      }
      next(error);
    }
  };
}
