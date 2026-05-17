/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     description: |
 *       Creates an active user account and returns JWT access + refresh tokens.
 *       Password policy is enforced server-side (min 12 chars, mixed case, digit, special).
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           examples:
 *             default:
 *               summary: Standard registration
 *               value:
 *                 fullName: Ada Lovelace
 *                 email: ada.lovelace@example.com
 *                 password: Str0ng!Passw0rd
 *     responses:
 *       '201':
 *         description: User created and authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterResponse'
 *             examples:
 *               success:
 *                 value:
 *                   user:
 *                     id: 11111111-1111-4111-8111-111111111111
 *                     fullName: Ada Lovelace
 *                     email: ada.lovelace@example.com
 *                     createdAt: '2026-05-16T12:00:00.000Z'
 *                   accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                   refreshToken: 11111111-1111-4111-8111-111111111111.8f5b3c2a-1d4e-4a9b-9c3d-2e1f0a9b8c7d
 *       '409':
 *         $ref: '#/components/responses/Conflict'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 *       '429':
 *         $ref: '#/components/responses/RateLimited'
 *
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Authenticate with email and password
 *     description: |
 *       Issues a new access/refresh token pair. Rate limited to **5 attempts per IP per 15 minutes**.
 *       Invalid credentials return `401` without revealing whether the email exists.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       '200':
 *         description: Authentication successful.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokens'
 *             examples:
 *               success:
 *                 value:
 *                   accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                   refreshToken: 11111111-1111-4111-8111-111111111111.8f5b3c2a-1d4e-4a9b-9c3d-2e1f0a9b8c7d
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 *       '429':
 *         $ref: '#/components/responses/RateLimited'
 *
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Rotate refresh token
 *     description: |
 *       Exchanges a valid refresh token for a new access + refresh pair (**rotation**).
 *       Reusing a revoked refresh token revokes the entire token family (reuse detection).
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshRequest'
 *     responses:
 *       '200':
 *         description: Tokens rotated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokens'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 *       '429':
 *         $ref: '#/components/responses/RateLimited'
 *
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Revoke refresh token
 *     description: |
 *       Revokes the supplied refresh token. Requires a valid **access** token (Bearer) plus the
 *       refresh token in the body. Idempotent for already-revoked tokens.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LogoutRequest'
 *     responses:
 *       '204':
 *         description: Refresh token revoked; no response body.
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 */

export {};
