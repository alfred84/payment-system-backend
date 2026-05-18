import path from 'node:path';

import swaggerJsdoc from 'swagger-jsdoc';

const openapiDocGlobs = [
  path.join(__dirname, 'components.js'),
  path.join(__dirname, 'components.ts'),
  path.join(__dirname, 'paths/*.js'),
  path.join(__dirname, 'paths/*.ts'),
];

export const openapiSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Payment System API',
      version: '1.0.0',
      description: [
        'REST API for user management, tokenized cards, and idempotent payments.',
        '',
        '**Authentication:** None. This API is intentionally public. Identity is resolved',
        'by `userId` (UUID) in the URL path, request body, or query parameter.',
        '',
        '**Payments:** Every `POST /payments` requires header `Idempotency-Key` (UUID v4).',
        '',
        '**Errors:** JSON envelope `{ error: { code, message, requestId, details? } }`.',
        'Cross-user resource access returns `404` (not `403`) by design.',
      ].join('\n'),
      contact: {
        name: 'Payment Platform Engineering',
      },
    },
    servers: [{ url: '/api/v1', description: 'API v1 (relative to host root)' }],
    tags: [
      { name: 'Health', description: 'Liveness checks.' },
      { name: 'Users', description: 'User registration and retrieval.' },
      { name: 'Cards', description: 'Tokenized payment methods.' },
      { name: 'Payments', description: 'Idempotent payment creation and history.' },
    ],
  },
  apis: openapiDocGlobs,
});
