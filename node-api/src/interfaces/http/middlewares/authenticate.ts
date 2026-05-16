import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { ErrorCode } from '../../../shared/errors/ErrorCode';
import { HttpError } from '../../../shared/errors/HttpError';
import type { JwtVerifierConfig } from '../config/jwt';

/**
 * Verify JWT access tokens (HS256 only).
 *
 * @param config - JWT verification settings.
 * @returns Express middleware.
 */
export function createAuthenticate(config: JwtVerifierConfig) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const header = req.header('authorization');
    if (!header?.startsWith('Bearer ')) {
      next(new HttpError(401, ErrorCode.UNAUTHORIZED, 'Missing or invalid authorization'));
      return;
    }

    const token = header.slice('Bearer '.length);
    try {
      const payload = jwt.verify(token, config.secret, {
        algorithms: ['HS256'],
        issuer: config.issuer,
        audience: config.audience,
      }) as jwt.JwtPayload;

      if (!payload.sub) {
        next(new HttpError(401, ErrorCode.UNAUTHORIZED, 'Invalid or expired token'));
        return;
      }

      req.auth = {
        userId: payload.sub,
        email: typeof payload.email === 'string' ? payload.email : '',
      };
      next();
    } catch {
      next(new HttpError(401, ErrorCode.UNAUTHORIZED, 'Invalid or expired token'));
    }
  };
}
