import { Router } from 'express';

import type { HttpContainer } from '../types';
import { PaymentsController } from '../controllers/PaymentsController';
import { requireIdempotencyKey } from '../middlewares/requireIdempotencyKey';
import { validate } from '../middlewares/validate';
import {
  createPaymentBodySchema,
  listPaymentsQuerySchema,
  paymentDetailQuerySchema,
  paymentIdParamSchema,
} from '../validators/payments.schemas';

/**
 * Create payment routes (no authentication — identity via user_id in body/query).
 *
 * @param container - Application composition root.
 * @returns Express router mounted at `/payments`.
 */
export function createPaymentsRouter(container: HttpContainer): Router {
  const router = Router();
  const controller = new PaymentsController(container);

  router.post(
    '/',
    requireIdempotencyKey,
    validate({ body: createPaymentBodySchema }),
    controller.create,
  );

  router.get('/', validate({ query: listPaymentsQuerySchema }), controller.list);

  router.get(
    '/:id',
    validate({ params: paymentIdParamSchema, query: paymentDetailQuerySchema }),
    controller.detail,
  );

  return router;
}
