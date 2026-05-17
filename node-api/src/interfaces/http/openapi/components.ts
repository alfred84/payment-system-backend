/**
 * Shared OpenAPI components (schemas, responses, parameters).
 *
 * @openapi
 * components:
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
 *     UserIdPath:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *         format: uuid
 *       example: 11111111-1111-4111-8111-111111111111
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
 *     UserIdQuery:
 *       in: query
 *       name: user_id
 *       required: true
 *       schema:
 *         type: string
 *         format: uuid
 *       example: 11111111-1111-4111-8111-111111111111
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
 *     UserResponse:
 *       type: object
 *       required: [id, fullName, email, createdAt, updatedAt]
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         fullName:
 *           type: string
 *           example: Ada Lovelace
 *         email:
 *           type: string
 *           format: email
 *           example: ada.lovelace@example.com
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateUserRequest:
 *       type: object
 *       required: [fullName, email]
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
 *     CardBrand:
 *       type: string
 *       enum: [VISA, MASTERCARD, AMEX, OTHER]
 *     CardResponse:
 *       type: object
 *       required: [id, cardholderName, last4, brand, expiryMonth, expiryYear, maskedPan, createdAt]
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         cardholderName:
 *           type: string
 *         last4:
 *           type: string
 *           pattern: '^\d{4}$'
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
 *       required: [userId, cardholderName, cardNumber, expiryMonth, expiryYear, cvv]
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *           description: Owner user id.
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
 *           pattern: '^\d{3,4}$'
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
 *       required: [id, status, amount, currency, cardId, metadata, createdAt, updatedAt]
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
 *       required: [userId, cardId, amount, currency]
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *           description: User who owns the card and will own the payment.
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
 *     NotFound:
 *       description: Resource not found or not owned by the requesting user (IDOR-safe 404).
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiError'
 *     Conflict:
 *       description: Resource conflict (e.g. email already registered).
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiError'
 *     IdempotencyConflict:
 *       description: Same Idempotency-Key reused with a different request body.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiError'
 *     RateLimited:
 *       description: Too many requests from this IP.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiError'
 *     ProcessorUnavailable:
 *       description: Internal payment processor unreachable or returned an error.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiError'
 *     InternalError:
 *       description: Unexpected server error (no stack trace in response).
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiError'
 */

export {};
