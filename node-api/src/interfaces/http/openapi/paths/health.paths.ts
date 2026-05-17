/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Service health check
 *     description: |
 *       Liveness probe for orchestration (Docker, load balancers). Does not require authentication.
 *       Does not check downstream dependencies (Postgres, processor).
 *     security: []
 *     responses:
 *       '200':
 *         description: API process is healthy.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *             example:
 *               status: ok
 *               service: payment-system-node-api
 *               timestamp: '2026-05-16T12:00:00.000Z'
 */

export {};
