import { Router } from 'express';

import type { HttpContainer } from '../types';
import { AuthController } from '../controllers/AuthController';
import { createAuthenticate } from '../middlewares/authenticate';
import {
  createLoginLimiter,
  createRefreshLimiter,
  createRegisterLimiter,
} from '../middlewares/rateLimiters';
import { validate } from '../middlewares/validate';
import {
  loginBodySchema,
  logoutBodySchema,
  refreshBodySchema,
  registerBodySchema,
} from '../validators/auth.schemas';

/**
 * Create authentication routes.
 *
 * @param container - Application composition root.
 * @returns Express router mounted at `/auth`.
 */
export function createAuthRouter(container: HttpContainer): Router {
  const router = Router();
  const controller = new AuthController(container);
  const registerLimiter = createRegisterLimiter();
  const loginLimiter = createLoginLimiter();
  const refreshLimiter = createRefreshLimiter();
  const authenticate = createAuthenticate({
    secret: container.env.JWT_ACCESS_SECRET,
    issuer: container.env.JWT_ISSUER,
    audience: container.env.JWT_AUDIENCE,
  });

  router.post(
    '/register',
    registerLimiter,
    validate({ body: registerBodySchema }),
    controller.register,
  );

  router.post('/login', loginLimiter, validate({ body: loginBodySchema }), controller.login);

  router.post(
    '/refresh',
    refreshLimiter,
    validate({ body: refreshBodySchema }),
    controller.refresh,
  );

  router.post('/logout', authenticate, validate({ body: logoutBodySchema }), controller.logout);

  return router;
}
