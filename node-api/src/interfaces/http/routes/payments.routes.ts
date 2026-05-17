import { Router } from 'express';

import type { HttpContainer } from '../types';
import { PaymentsController } from '../controllers/PaymentsController';
import { createAuthenticate } from '../middlewares/authenticate';
import { requireIdempotencyKey } from '../middlewares/requireIdempotencyKey';
import { validate } from '../middlewares/validate';
import {
  createPaymentBodySchema,
  listPaymentsQuerySchema,
  paymentIdParamSchema,
} from '../validators/payments.schemas';

/**
 * Create payment routes (JWT required).
 *
 * @param container - Application composition root.
 * @returns Express router mounted at `/payments`.
 */
export function createPaymentsRouter(container: HttpContainer): Router {
  const router = Router();
  const controller = new PaymentsController(container);
  const authenticate = createAuthenticate({
    secret: container.env.JWT_ACCESS_SECRET,
    issuer: container.env.JWT_ISSUER,
    audience: container.env.JWT_AUDIENCE,
  });

  router.use(authenticate);

  router.post(
    '/',
    requireIdempotencyKey,
    validate({ body: createPaymentBodySchema }),
    controller.create,
  );

  router.get('/', validate({ query: listPaymentsQuerySchema }), controller.list);

  router.get('/:id', validate({ params: paymentIdParamSchema }), controller.detail);

  return router;
}
