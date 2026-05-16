import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import type { Env } from '../../shared/config/env';
import type winston from 'winston';
import { createHealthRouter } from './routes/health.routes';

export interface AppDependencies {
  env: Env;
  logger: winston.Logger;
}

/**
 * Create and configure the Express application (no listen).
 *
 * @param deps - Validated environment and logger.
 * @returns Configured Express app instance.
 */
export function createApp(deps: AppDependencies): Express {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: deps.env.CORS_ORIGINS,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));

  app.use(createHealthRouter());

  app.get('/', (_req, res) => {
    res.json({
      service: 'payment-system-node-api',
      docs: '/api/v1/docs',
      health: '/health',
    });
  });

  return app;
}
