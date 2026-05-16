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
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Registration, login, refresh, and logout
 */

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

  /**
   * @openapi
   * /auth/register:
   *   post:
   *     tags: [Auth]
   *     summary: Register a new user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [fullName, email, password]
   *             properties:
   *               fullName: { type: string }
   *               email: { type: string, format: email }
   *               password: { type: string, format: password }
   *     responses:
   *       '201':
   *         description: User registered with tokens
   */
  router.post(
    '/register',
    registerLimiter,
    validate({ body: registerBodySchema }),
    controller.register,
  );

  /**
   * @openapi
   * /auth/login:
   *   post:
   *     tags: [Auth]
   *     summary: Authenticate a user
   *     responses:
   *       '200':
   *         description: Tokens issued
   *       '429':
   *         description: Rate limited
   */
  router.post('/login', loginLimiter, validate({ body: loginBodySchema }), controller.login);

  /**
   * @openapi
   * /auth/refresh:
   *   post:
   *     tags: [Auth]
   *     summary: Rotate refresh token
   */
  router.post(
    '/refresh',
    refreshLimiter,
    validate({ body: refreshBodySchema }),
    controller.refresh,
  );

  /**
   * @openapi
   * /auth/logout:
   *   post:
   *     tags: [Auth]
   *     summary: Revoke refresh token
   *     security:
   *       - bearerAuth: []
   */
  router.post('/logout', authenticate, validate({ body: logoutBodySchema }), controller.logout);

  return router;
}
