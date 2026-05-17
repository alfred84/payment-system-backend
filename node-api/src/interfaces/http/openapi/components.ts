/**
 * Shared OpenAPI components (schemas, responses, parameters, examples).
 *
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: |
 *         Access token from `POST /auth/login` or `POST /auth/register`.
 *         Send as `Authorization: Bearer <accessToken>`. Expires in **15 minutes**.
 *
 *   parameters:
 *     IdempotencyKeyHeader:
 *       in: header
 *       name: Idempotency-Key
 *       required: true
 *       description: |
 *         UUID v4 idempotency key. Required for every `POST /payments`.
 *         Reuse the same key with the **same body** to safely retry; the API returns the original payment.
 *         Reuse with a **different body** yields `409 IDEMPOTENCY_CONFLICT`.
 *       schema:
 *         type: string
 *         format: uuid
 *       example: 8f5b3c2a-1d4e-4a9b-9c3d-2e1f0a9b8c7d
 *     CardIdPath:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *         format: uuid
 *       example: 22222222-2222-4222-8222-222222222222
 *     PaymentIdPath:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *         format: uuid
 *       example: 33333333-3333-4333-8333-333333333333
 *     PaymentsLimitQuery:
 *       in: query
 *       name: limit
 *       schema:
 *         type: integer
 *         minimum: 1
 *         maximum: 100
 *         default: 20
 *       description: Page size (max 100).
 *     PaymentsCursorQuery:
 *       in: query
 *       name: cursor
 *       schema:
 *         type: string
 *       description: Opaque cursor from a previous response `nextCursor`.
 *     PaymentsStatusQuery:
 *       in: query
 *       name: status
 *       schema:
 *         $ref: '#/components/schemas/PaymentStatus'
 *       description: Optional filter by terminal status.
 *
 *   schemas:
 *     ApiErrorCode:
 *       type: string
 *       enum:
 *         - VALIDATION_ERROR
 *         - UNAUTHORIZED
 *         - FORBIDDEN
 *         - NOT_FOUND
 *         - CONFLICT
 *         - RATE_LIMITED
 *         - IDEMPOTENCY_CONFLICT
 *         - PROCESSOR_UNAVAILABLE
 *         - INTERNAL_ERROR
 *     ValidationDetail:
 *       type: object
 *       properties:
 *         field:
 *           type: string
 *           example: email
 *         issue:
 *           type: string
 *           example: Invalid email
 *     ApiError:
 *       type: object
 *       required: [error]
 *       properties:
 *         error:
 *           type: object
 *           required: [code, message, requestId]
 *           properties:
 *             code:
 *               $ref: '#/components/schemas/ApiErrorCode'
 *             message:
 *               type: string
 *             requestId:
 *               type: string
 *               format: uuid
 *             details:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ValidationDetail'
 *     AuthTokens:
 *       type: object
 *       required: [accessToken, refreshToken]
 *       properties:
 *         accessToken:
 *           type: string
 *           description: JWT access token (15 min TTL).
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         refreshToken:
 *           type: string
 *           description: Opaque rotating refresh token (7 day TTL). Store securely; rotate on each refresh.
 *           example: 11111111-1111-4111-8111-111111111111.8f5b3c2a-1d4e-4a9b-9c3d-2e1f0a9b8c7d
 *     UserSummary:
 *       type: object
 *       required: [id, fullName, email, createdAt]
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         fullName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         createdAt:
 *           type: string
 *           format: date-time
 *     RegisterRequest:
 *       type: object
 *       required: [fullName, email, password]
 *       properties:
 *         fullName:
 *           type: string
 *           minLength: 2
 *           maxLength: 120
 *           example: Ada Lovelace
 *         email:
 *           type: string
 *           format: email
 *           maxLength: 255
 *           example: ada.lovelace@example.com
 *         password:
 *           type: string
 *           format: password
 *           minLength: 12
 *           description: |
 *             Min 12 chars; at least one uppercase, lowercase, digit, and special character.
 *           example: Str0ng!Passw0rd
 *     RegisterResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/AuthTokens'
 *         - type: object
 *           required: [user]
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/UserSummary'
 *     LoginRequest:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: ada.lovelace@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: Str0ng!Passw0rd
 *     RefreshRequest:
 *       type: object
 *       required: [refreshToken]
 *       properties:
 *         refreshToken:
 *           type: string
 *           description: Current refresh token (rotated on success).
 *     LogoutRequest:
 *       type: object
 *       required: [refreshToken]
 *       properties:
 *         refreshToken:
 *           type: string
 *           description: Refresh token to revoke for this device/session.
 *     CardBrand:
 *       type: string
 *       enum: [VISA, MASTERCARD, AMEX, OTHER]
 *     CardResponse:
 *       type: object
 *       required:
 *         - id
 *         - cardholderName
 *         - last4
 *         - brand
 *         - expiryMonth
 *         - expiryYear
 *         - maskedPan
 *         - createdAt
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         cardholderName:
 *           type: string
 *         last4:
 *           type: string
 *           pattern: '^\\d{4}$'
 *           example: '4242'
 *         brand:
 *           $ref: '#/components/schemas/CardBrand'
 *         expiryMonth:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         expiryYear:
 *           type: integer
 *           example: 2030
 *         maskedPan:
 *           type: string
 *           description: Display-only masked PAN (never full card number).
 *           example: '**** **** **** 4242'
 *         createdAt:
 *           type: string
 *           format: date-time
 *     RegisterCardRequest:
 *       type: object
 *       required: [cardholderName, cardNumber, expiryMonth, expiryYear, cvv]
 *       properties:
 *         cardholderName:
 *           type: string
 *           minLength: 2
 *           maxLength: 120
 *         cardNumber:
 *           type: string
 *           minLength: 13
 *           maxLength: 19
 *           description: Full PAN sent once for tokenization; never stored server-side.
 *           example: '4242424242424242'
 *         expiryMonth:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *           example: 12
 *         expiryYear:
 *           type: integer
 *           minimum: 2024
 *           example: 2030
 *         cvv:
 *           type: string
 *           pattern: '^\\d{3,4}$'
 *           description: CVV is used for tokenization only and is never persisted.
 *           example: '123'
 *     CardListResponse:
 *       type: object
 *       required: [data, count]
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CardResponse'
 *         count:
 *           type: integer
 *     PaymentStatus:
 *       type: string
 *       enum: [PENDING, APPROVED, REJECTED]
 *     PaymentResponse:
 *       type: object
 *       required:
 *         - id
 *         - status
 *         - amount
 *         - currency
 *         - cardId
 *         - metadata
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         status:
 *           $ref: '#/components/schemas/PaymentStatus'
 *         amount:
 *           type: number
 *           format: double
 *           example: 19.99
 *         currency:
 *           type: string
 *           minLength: 3
 *           maxLength: 3
 *           pattern: '^[A-Z]{3}$'
 *           example: USD
 *         cardId:
 *           type: string
 *           format: uuid
 *         processorReference:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         processorMessage:
 *           type: string
 *           nullable: true
 *         description:
 *           type: string
 *           nullable: true
 *         metadata:
 *           type: object
 *           additionalProperties: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreatePaymentRequest:
 *       type: object
 *       required: [cardId, amount, currency]
 *       properties:
 *         cardId:
 *           type: string
 *           format: uuid
 *         amount:
 *           type: number
 *           format: double
 *           exclusiveMinimum: 0
 *           description: Positive amount with at most 2 decimal places.
 *           example: 19.99
 *         currency:
 *           type: string
 *           minLength: 3
 *           maxLength: 3
 *           pattern: '^[A-Z]{3}$'
 *           default: USD
 *           example: USD
 *         description:
 *           type: string
 *           maxLength: 255
 *           example: Monthly subscription
 *         metadata:
 *           type: object
 *           additionalProperties: true
 *           description: Optional client metadata (included in idempotency fingerprint).
 *     PaymentListResponse:
 *       type: object
 *       required: [data, nextCursor]
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PaymentResponse'
 *         nextCursor:
 *           type: string
 *           nullable: true
 *           description: Pass as `cursor` query param for the next page, or `null` when done.
 *     HealthResponse:
 *       type: object
 *       required: [status, service, timestamp]
 *       properties:
 *         status:
 *           type: string
 *           example: ok
 *         service:
 *           type: string
 *           example: payment-system-node-api
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *   responses:
 *     ValidationError:
 *       description: Request validation failed (Zod).
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiError'
 *           example:
 *             error:
 *               code: VALIDATION_ERROR
 *               message: Validation failed
 *               requestId: 6f3e2b1a-4c5d-4e9f-8a1b-2c3d4e5f6a7b
 *               details:
 *                 - field: email
 *                   issue: Invalid email
 *     Unauthorized:
 *       description: Missing, invalid, or expired access token; or invalid credentials / refresh token.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiError'
 *           example:
 *             error:
 *               code: UNAUTHORIZED
 *               message: Invalid credentials
 *               requestId: 6f3e2b1a-4c5d-4e9f-8a1b-2c3d4e5f6a7b
 *     NotFound:
 *       description: Resource not found or not owned by the authenticated user (IDOR-safe 404).
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiError'
 *           example:
 *             error:
 *               code: NOT_FOUND
 *               message: Payment not found
 *               requestId: 6f3e2b1a-4c5d-4e9f-8a1b-2c3d4e5f6a7b
 *     Conflict:
 *       description: Resource conflict (e.g. email already registered).
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiError'
 *           example:
 *             error:
 *               code: CONFLICT
 *               message: Email already in use
 *               requestId: 6f3e2b1a-4c5d-4e9f-8a1b-2c3d4e5f6a7b
 *     IdempotencyConflict:
 *       description: Same Idempotency-Key reused with a different request body.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiError'
 *           example:
 *             error:
 *               code: IDEMPOTENCY_CONFLICT
 *               message: Idempotency key conflict
 *               requestId: 6f3e2b1a-4c5d-4e9f-8a1b-2c3d4e5f6a7b
 *     RateLimited:
 *       description: Too many auth attempts from this IP (login/register/refresh limiters).
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiError'
 *           example:
 *             error:
 *               code: RATE_LIMITED
 *               message: Too many requests
 *               requestId: 6f3e2b1a-4c5d-4e9f-8a1b-2c3d4e5f6a7b
 *     ProcessorUnavailable:
 *       description: Internal payment processor unreachable or returned an error.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiError'
 *           example:
 *             error:
 *               code: PROCESSOR_UNAVAILABLE
 *               message: Payment processor unavailable
 *               requestId: 6f3e2b1a-4c5d-4e9f-8a1b-2c3d4e5f6a7b
 *     InternalError:
 *       description: Unexpected server error (no stack trace in response).
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiError'
 */

export {};
