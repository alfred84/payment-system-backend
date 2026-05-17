import path from 'node:path';

import swaggerJsdoc from 'swagger-jsdoc';

const routeDocGlobs = [
  path.join(__dirname, '../routes/*.js'),
  path.join(__dirname, '../routes/*.ts'),
];

export const openapiSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Payment System API',
      version: '1.0.0',
      description:
        'RESTful API for users, cards and payments. Source of truth: PROJECT_REQUIREMENTS.md.',
    },
    servers: [{ url: '/api/v1' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: routeDocGlobs,
});
