import { Router } from 'express';

import type { HttpContainer } from '../types';
import { CardsController } from '../controllers/CardsController';
import { createAuthenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';
import { cardIdParamSchema, registerCardBodySchema } from '../validators/cards.schemas';

/**
 * @openapi
 * tags:
 *   - name: Cards
 *     description: Tokenized payment cards
 */

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

  /**
   * @openapi
   * /cards:
   *   post:
   *     tags: [Cards]
   *     summary: Register a card
   *     security:
   *       - bearerAuth: []
   */
  router.post('/', validate({ body: registerCardBodySchema }), controller.register);

  /**
   * @openapi
   * /cards:
   *   get:
   *     tags: [Cards]
   *     summary: List active cards
   *     security:
   *       - bearerAuth: []
   */
  router.get('/', controller.list);

  /**
   * @openapi
   * /cards/{id}:
   *   delete:
   *     tags: [Cards]
   *     summary: Soft-delete a card
   *     security:
   *       - bearerAuth: []
   */
  router.delete('/:id', validate({ params: cardIdParamSchema }), controller.remove);

  return router;
}
