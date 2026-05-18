import { Router } from 'express';

import type { HttpContainer } from '../types';
import { UsersController } from '../controllers/UsersController';
import { validate } from '../middlewares/validate';
import { createUserBodySchema, userIdParamSchema } from '../validators/users.schemas';

/**
 * Create user routes (no authentication required).
 *
 * @param container - Application composition root.
 * @returns Express router mounted at `/users`.
 */
export function createUsersRouter(container: HttpContainer): Router {
  const router = Router();
  const controller = new UsersController(container);

  router.post('/', validate({ body: createUserBodySchema }), controller.create);
  router.get('/', controller.list);
  router.get('/:id', validate({ params: userIdParamSchema }), controller.detail);

  return router;
}
