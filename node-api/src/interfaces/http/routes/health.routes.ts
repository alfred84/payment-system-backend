import { Router } from 'express';

/**
 * Health check routes for container orchestration and load balancers.
 *
 * @returns Express router mounted at /health.
 */
export function createHealthRouter(): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'payment-system-node-api',
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}
