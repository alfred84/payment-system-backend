import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';

import type { HttpContainer } from './types';
import { createErrorMapper } from './middlewares/errorMapper';
import { createRequestLogger } from './middlewares/requestLogger';
import { createCardsRouter } from './routes/cards.routes';
import { createDocsRouter } from './routes/docs.routes';
import { createHealthRouter } from './routes/health.routes';
import { createPaymentsRouter } from './routes/payments.routes';
import { createUsersRouter } from './routes/users.routes';
import type winston from 'winston';

export interface AppDependencies extends HttpContainer {
  logger: winston.Logger;
}

/**
 * Create and configure the Express application (no listen).
 *
 * @param deps - Composition root dependencies and logger.
 * @returns Configured Express app instance.
 */
export function createApp(deps: AppDependencies): Express {
  const app = express();

  app.use(createRequestLogger(deps.logger));
  app.use(helmet());
  app.use(
    cors({
      origin: deps.env.CORS_ORIGINS,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));

  app.use(createHealthRouter());

  app.use('/api/v1/users', createUsersRouter(deps));
  app.use('/api/v1/cards', createCardsRouter(deps));
  app.use('/api/v1/payments', createPaymentsRouter(deps));
  app.use((req, res, next) => {
    if (req.method === 'GET' && req.path === '/api/v1/docs') {
      res.redirect(301, '/api/v1/docs/');
      return;
    }
    next();
  });
  app.use('/api/v1/docs', createDocsRouter());

  app.get('/', (_req, res) => {
    res.json({
      service: 'payment-system-node-api',
      docs: '/api/v1/docs',
      health: '/health',
    });
  });

  app.use(createErrorMapper(deps.logger));

  return app;
}
