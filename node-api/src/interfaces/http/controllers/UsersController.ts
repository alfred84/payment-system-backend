import type { NextFunction, Request, Response } from 'express';
import type { z } from 'zod';

import type { HttpContainer } from '../types';
import { mapDomainErrorToHttp } from '../../../shared/errors/mapDomainErrorToHttp';
import type { createUserBodySchema } from '../validators/users.schemas';

type CreateUserBody = z.infer<typeof createUserBodySchema>;

/**
 * HTTP controller for user routes.
 */
export class UsersController {
  constructor(private readonly container: HttpContainer) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as CreateUserBody;
      const user = await this.container.createUser.execute(body);
      res.status(201).json({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      });
    } catch (error) {
      next(mapDomainErrorToHttp(error));
    }
  };

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.container.listUsers.execute();
      res.status(200).json({
        data: users.map((u) => ({
          id: u.id,
          fullName: u.fullName,
          email: u.email,
          createdAt: u.createdAt.toISOString(),
          updatedAt: u.updatedAt.toISOString(),
        })),
        count: users.length,
      });
    } catch (error) {
      next(mapDomainErrorToHttp(error));
    }
  };

  detail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.container.getUserById.execute({
        userId: req.params.id as string,
      });
      res.status(200).json({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      });
    } catch (error) {
      next(mapDomainErrorToHttp(error));
    }
  };
}
