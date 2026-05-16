import type { Server } from 'http';
import type { Express } from 'express';
import type winston from 'winston';

/**
 * Start the HTTP server on the given port.
 *
 * @param app - Configured Express application.
 * @param port - TCP port to bind.
 * @param logger - Logger instance for startup messages.
 * @returns Node HTTP server instance.
 */
export function startServer(app: Express, port: number, logger: winston.Logger): Server {
  const server = app.listen(port, () => {
    logger.info('Server started', { event_type: 'server_start', port });
  });
  return server;
}
