import 'dotenv/config';
import { loadEnv } from './shared/config/env';
import { createLogger } from './shared/logger/winstonLogger';
import { createApp } from './interfaces/http/app';
import { startServer } from './interfaces/http/server';

/**
 * Application entry point — validates env, builds DI graph, starts HTTP server.
 */
function bootstrap(): void {
  const env = loadEnv();
  const logger = createLogger(env.LOG_LEVEL);
  const app = createApp({ env, logger });
  startServer(app, env.NODE_API_PORT, logger);
}

try {
  bootstrap();
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`Fatal bootstrap error: ${message}\n`);
  process.exit(1);
}
