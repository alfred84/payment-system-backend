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
        'REST API for user onboarding, tokenized cards, and idempotent payments.',
        '',
        '**Authentication:** Obtain `accessToken` + `refreshToken` from `POST /auth/register` or `POST /auth/login`.',
        'Send `Authorization: Bearer <accessToken>` on protected routes. Refresh before expiry (15 min) via `POST /auth/refresh`.',
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
      {
        name: 'Health',
        description: 'Liveness checks (no auth).',
      },
      {
        name: 'Auth',
        description: 'Registration, login, JWT refresh rotation, logout.',
      },
      {
        name: 'Cards',
        description: 'Tokenized payment methods (Bearer required).',
      },
      {
        name: 'Payments',
        description: 'Idempotent payment creation and history (Bearer required).',
      },
    ],
  },
  apis: openapiDocGlobs,
});
