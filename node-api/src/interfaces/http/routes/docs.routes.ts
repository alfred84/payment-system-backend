import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';

import { openapiSpec } from '../openapi/swagger.config';

/**
 * Swagger UI and raw OpenAPI document routes.
 *
 * @returns Express router mounted at `/docs`.
 */
export function createDocsRouter(): Router {
  const router = Router();

  router.get('/openapi.json', (_req, res) => {
    res.json(openapiSpec);
  });

  router.use('/', swaggerUi.serve, swaggerUi.setup(openapiSpec, { explorer: true }));

  return router;
}
