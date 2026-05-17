import { Router } from 'express';

import type { HttpContainer } from '../types';
import { CardsController } from '../controllers/CardsController';
import { validate } from '../middlewares/validate';
import {
  cardIdParamSchema,
  deleteCardQuerySchema,
  listCardsQuerySchema,
  registerCardBodySchema,
} from '../validators/cards.schemas';

/**
 * Create card routes (no authentication — identity via user_id in body/query).
 *
 * @param container - Application composition root.
 * @returns Express router mounted at `/cards`.
 */
export function createCardsRouter(container: HttpContainer): Router {
  const router = Router();
  const controller = new CardsController(container);

  router.post('/', validate({ body: registerCardBodySchema }), controller.register);
  router.get('/', validate({ query: listCardsQuerySchema }), controller.list);
  router.delete(
    '/:id',
    validate({ params: cardIdParamSchema, query: deleteCardQuerySchema }),
    controller.remove,
  );

  return router;
}
