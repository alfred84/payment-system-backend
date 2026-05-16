import type { NextFunction, Request } from 'express';

import { ErrorCode } from '../../../shared/errors/ErrorCode';
import { HttpError } from '../../../shared/errors/HttpError';

/**
 * Ensure the request has been authenticated.
 *
 * @param req - Express request.
 * @param next - Express next function.
 * @returns Authenticated user id or null when unauthorized.
 */
export function requireAuthUserId(req: Request, next: NextFunction): string | null {
  if (!req.auth?.userId) {
    next(new HttpError(401, ErrorCode.UNAUTHORIZED, 'Missing or invalid authorization'));
    return null;
  }
  return req.auth.userId;
}
