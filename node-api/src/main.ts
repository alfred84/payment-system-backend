import 'dotenv/config';
import { createContainer } from './infrastructure/di/container';
import { createApp } from './interfaces/http/app';
import { toAppDependencies } from './interfaces/http/containerAdapter';
import { startServer } from './interfaces/http/server';

/**
 * Application entry point — validates env, builds DI graph, starts HTTP server.
 */
function bootstrap(): void {
  const container = createContainer();
  const app = createApp(toAppDependencies(container));
  startServer(app, container.env.NODE_API_PORT, container.logger);
}

try {
  bootstrap();
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`Fatal bootstrap error: ${message}\n`);
  process.exit(1);
}
