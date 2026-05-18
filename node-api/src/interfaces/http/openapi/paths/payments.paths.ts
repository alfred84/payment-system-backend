/**
 * @openapi
 * /payments:
 *   post:
 *     tags: [Payments]
 *     summary: Create a payment (idempotent)
 *     description: |
 *       Charges a registered card through the internal processor. **Idempotency-Key** (UUID v4) is mandatory.
 *       `userId` in the body identifies the payer and validates card ownership.
 *
 *       - Processor **approval** → `status: APPROVED` (HTTP 201).
 *       - Processor **decline** → `status: REJECTED` (HTTP 201 — resource created, not a transport error).
 *       - Processor outage → `502 PROCESSOR_UNAVAILABLE`.
 *     parameters:
 *       - $ref: '#/components/parameters/IdempotencyKeyHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePaymentRequest'
 *           examples:
 *             subscription:
 *               value:
 *                 userId: 11111111-1111-4111-8111-111111111111
 *                 cardId: 22222222-2222-4222-8222-222222222222
 *                 amount: 19.99
 *                 currency: USD
 *                 description: Monthly subscription
 *     responses:
 *       '201':
 *         description: Payment created (approved or rejected).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentResponse'
 *       '400':
 *         description: Missing or invalid Idempotency-Key header.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '404':
 *         description: Card not found or not owned by user.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '409':
 *         $ref: '#/components/responses/IdempotencyConflict'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 *       '502':
 *         $ref: '#/components/responses/ProcessorUnavailable'
 *   get:
 *     tags: [Payments]
 *     summary: List payment history for a user (keyset pagination)
 *     description: |
 *       Returns the user's payments ordered by `createdAt` descending.
 *       Use `nextCursor` from the response as the `cursor` query parameter for the next page.
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdQuery'
 *       - $ref: '#/components/parameters/PaymentsLimitQuery'
 *       - $ref: '#/components/parameters/PaymentsCursorQuery'
 *       - $ref: '#/components/parameters/PaymentsStatusQuery'
 *     responses:
 *       '200':
 *         description: Payment page.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentListResponse'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 *
 * /payments/{id}:
 *   get:
 *     tags: [Payments]
 *     summary: Get payment detail
 *     description: |
 *       Returns a single payment. `user_id` query parameter validates ownership —
 *       cross-user access returns `404 NOT_FOUND` (same as missing id).
 *     parameters:
 *       - $ref: '#/components/parameters/PaymentIdPath'
 *       - $ref: '#/components/parameters/UserIdQuery'
 *     responses:
 *       '200':
 *         description: Payment detail.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentResponse'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 */

export {};
