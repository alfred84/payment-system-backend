import type { NextFunction, Request, Response } from 'express';
import type { z } from 'zod';

import type { HttpContainer } from '../types';
import { requireAuthUserId } from '../middlewares/requireAuth';
import { ErrorCode } from '../../../shared/errors/ErrorCode';
import { HttpError } from '../../../shared/errors/HttpError';
import { mapDomainErrorToHttp } from '../../../shared/errors/mapDomainErrorToHttp';
import {
  decodePaymentCursor,
  encodePaymentCursor,
  toPaymentResponse,
} from '../mappers/paymentResponse';
import type {
  createPaymentBodySchema,
  listPaymentsQuerySchema,
} from '../validators/payments.schemas';

type CreatePaymentBody = z.infer<typeof createPaymentBodySchema>;

/**
 * HTTP controller for payment routes.
 */
export class PaymentsController {
  constructor(private readonly container: HttpContainer) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = requireAuthUserId(req, next);
      if (!userId) {
        return;
      }

      const idempotencyKey = req.idempotencyKey;
      if (!idempotencyKey) {
        next(new HttpError(400, ErrorCode.VALIDATION_ERROR, 'Idempotency-Key header is required'));
        return;
      }

      const body = req.body as CreatePaymentBody;
      const payment = await this.container.createPayment.execute({
        userId,
        cardId: body.cardId,
        amount: body.amount,
        currency: body.currency,
        idempotencyKey,
        description: body.description,
        metadata: body.metadata,
      });

      res.status(201).json(toPaymentResponse(payment));
    } catch (error) {
      next(mapDomainErrorToHttp(error));
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = requireAuthUserId(req, next);
      if (!userId) {
        return;
      }

      const { limit, cursor, status } = req.query as unknown as z.infer<
        typeof listPaymentsQuerySchema
      >;

      let cursorCreatedAt: Date | undefined;
      let cursorId: string | undefined;
      if (cursor) {
        const decoded = decodePaymentCursor(cursor);
        if (!decoded) {
          next(new HttpError(422, ErrorCode.VALIDATION_ERROR, 'Invalid cursor'));
          return;
        }
        cursorCreatedAt = decoded.createdAt;
        cursorId = decoded.id;
      }

      const payments = await this.container.listPaymentHistory.execute({
        userId,
        limit: limit + 1,
        cursorCreatedAt,
        cursorId,
      });

      const filtered = status ? payments.filter((payment) => payment.status === status) : payments;
      const hasMore = filtered.length > limit;
      const page = hasMore ? filtered.slice(0, limit) : filtered;
      const last = page.at(-1);
      const nextCursor = hasMore && last ? encodePaymentCursor(last.createdAt, last.id) : null;

      res.status(200).json({
        data: page.map(toPaymentResponse),
        nextCursor,
      });
    } catch (error) {
      next(mapDomainErrorToHttp(error));
    }
  };

  detail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = requireAuthUserId(req, next);
      if (!userId) {
        return;
      }

      const payment = await this.container.getPaymentDetail.execute({
        userId,
        paymentId: req.params.id as string,
      });
      res.status(200).json(toPaymentResponse(payment));
    } catch (error) {
      next(mapDomainErrorToHttp(error));
    }
  };
}
