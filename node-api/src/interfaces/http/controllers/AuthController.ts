import type { NextFunction, Request, Response } from 'express';
import type { z } from 'zod';

import type { HttpContainer } from '../types';
import { mapDomainErrorToHttp } from '../../../shared/errors/mapDomainErrorToHttp';
import type {
  loginBodySchema,
  logoutBodySchema,
  refreshBodySchema,
  registerBodySchema,
} from '../validators/auth.schemas';

type RegisterBody = z.infer<typeof registerBodySchema>;
type LoginBody = z.infer<typeof loginBodySchema>;
type RefreshBody = z.infer<typeof refreshBodySchema>;
type LogoutBody = z.infer<typeof logoutBodySchema>;

/**
 * HTTP controller for authentication routes.
 */
export class AuthController {
  constructor(private readonly container: HttpContainer) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as RegisterBody;
      const user = await this.container.registerUser.execute(body);
      const tokens = await this.container.authenticateUser.execute({
        email: body.email,
        password: body.password,
      });

      res.status(201).json({
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          createdAt: user.createdAt.toISOString(),
        },
        ...tokens,
      });
    } catch (error) {
      next(mapDomainErrorToHttp(error));
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tokens = await this.container.authenticateUser.execute(req.body as LoginBody);
      res.status(200).json(tokens);
    } catch (error) {
      next(mapDomainErrorToHttp(error));
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tokens = await this.container.refreshAccessToken.execute(req.body as RefreshBody);
      res.status(200).json(tokens);
    } catch (error) {
      next(mapDomainErrorToHttp(error));
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.container.logout.execute(req.body as LogoutBody);
      res.status(204).send();
    } catch (error) {
      next(mapDomainErrorToHttp(error));
    }
  };
}
