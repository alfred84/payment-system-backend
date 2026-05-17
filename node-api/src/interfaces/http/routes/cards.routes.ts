import { Router } from 'express';

import type { HttpContainer } from '../types';
import { CardsController } from '../controllers/CardsController';
import { createAuthenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';
import { cardIdParamSchema, registerCardBodySchema } from '../validators/cards.schemas';

/**
 * Create card routes (JWT required).
 *
 * @param container - Application composition root.
 * @returns Express router mounted at `/cards`.
 */
export function createCardsRouter(container: HttpContainer): Router {
  const router = Router();
  const controller = new CardsController(container);
  const authenticate = createAuthenticate({
    secret: container.env.JWT_ACCESS_SECRET,
    issuer: container.env.JWT_ISSUER,
    audience: container.env.JWT_AUDIENCE,
  });

  router.use(authenticate);

  router.post('/', validate({ body: registerCardBodySchema }), controller.register);

  router.get('/', controller.list);

  router.delete('/:id', validate({ params: cardIdParamSchema }), controller.remove);

  return router;
}
