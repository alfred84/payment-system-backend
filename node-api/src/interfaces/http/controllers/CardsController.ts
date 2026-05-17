import type { NextFunction, Request, Response } from 'express';
import type { z } from 'zod';

import type { HttpContainer } from '../types';
import { mapDomainErrorToHttp } from '../../../shared/errors/mapDomainErrorToHttp';
import type {
  deleteCardQuerySchema,
  listCardsQuerySchema,
  registerCardBodySchema,
} from '../validators/cards.schemas';

type RegisterCardBody = z.infer<typeof registerCardBodySchema>;
type ListCardsQuery = z.infer<typeof listCardsQuerySchema>;
type DeleteCardQuery = z.infer<typeof deleteCardQuerySchema>;

/**
 * HTTP controller for card routes.
 */
export class CardsController {
  constructor(private readonly container: HttpContainer) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as RegisterCardBody;
      const card = await this.container.registerCard.execute({
        userId: body.userId,
        cardholderName: body.cardholderName,
        cardNumber: body.cardNumber,
        expiryMonth: body.expiryMonth,
        expiryYear: body.expiryYear,
        cvv: body.cvv,
      });

      res.status(201).json({
        id: card.id,
        cardholderName: card.cardholderName,
        last4: card.lastFourDigits,
        brand: card.brand,
        expiryMonth: card.expiryMonth,
        expiryYear: card.expiryYear,
        maskedPan: card.maskedPan,
        createdAt: card.createdAt.toISOString(),
      });
    } catch (error) {
      next(mapDomainErrorToHttp(error));
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user_id: userId } = req.query as unknown as ListCardsQuery;
      const cards = await this.container.listUserCards.execute({ userId });
      res.status(200).json({
        data: cards.map((card) => ({
          id: card.id,
          cardholderName: card.cardholderName,
          last4: card.lastFourDigits,
          brand: card.brand,
          expiryMonth: card.expiryMonth,
          expiryYear: card.expiryYear,
          maskedPan: card.maskedPan,
          createdAt: card.createdAt.toISOString(),
        })),
        count: cards.length,
      });
    } catch (error) {
      next(mapDomainErrorToHttp(error));
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user_id: userId } = req.query as unknown as DeleteCardQuery;
      await this.container.softDeleteCard.execute({
        userId,
        cardId: req.params.id as string,
      });
      res.status(204).send();
    } catch (error) {
      next(mapDomainErrorToHttp(error));
    }
  };
}
