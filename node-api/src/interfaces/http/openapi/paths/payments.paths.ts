/**
 * @openapi
 * /payments:
 *   post:
 *     tags: [Payments]
 *     summary: Create a payment (idempotent)
 *     description: |
 *       Charges a registered card through the internal processor. **Idempotency-Key** (UUID v4) is mandatory.
 *
 *       - Processor **approval** → `status: APPROVED` (HTTP 201).
 *       - Processor **decline** → `status: REJECTED` (HTTP 201 — resource created, not a transport error).
 *       - Processor outage → `502 PROCESSOR_UNAVAILABLE`.
 *     security:
 *       - bearerAuth: []
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
 *             examples:
 *               approved:
 *                 summary: Approved payment
 *                 value:
 *                   id: 33333333-3333-4333-8333-333333333333
 *                   status: APPROVED
 *                   amount: 19.99
 *                   currency: USD
 *                   cardId: 22222222-2222-4222-8222-222222222222
 *                   processorReference: 44444444-4444-4444-8444-444444444444
 *                   processorMessage: Approved
 *                   description: Monthly subscription
 *                   metadata: {}
 *                   createdAt: '2026-05-16T12:00:00.000Z'
 *                   updatedAt: '2026-05-16T12:00:00.000Z'
 *               rejected:
 *                 summary: Declined payment
 *                 value:
 *                   id: 33333333-3333-4333-8333-333333333333
 *                   status: REJECTED
 *                   amount: 19.99
 *                   currency: USD
 *                   cardId: 22222222-2222-4222-8222-222222222222
 *                   processorReference: null
 *                   processorMessage: Declined
 *                   description: Monthly subscription
 *                   metadata: {}
 *                   createdAt: '2026-05-16T12:00:00.000Z'
 *                   updatedAt: '2026-05-16T12:00:00.000Z'
 *       '400':
 *         description: Missing or invalid Idempotency-Key header.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
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
 *     summary: List payment history (keyset pagination)
 *     description: |
 *       Returns the authenticated user's payments ordered by `createdAt` descending.
 *       Use `nextCursor` from the response as the `cursor` query parameter for the next page.
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 *
 * /payments/{id}:
 *   get:
 *     tags: [Payments]
 *     summary: Get payment detail
 *     description: |
 *       Returns a single payment owned by the authenticated user.
 *       Cross-user access returns `404 NOT_FOUND` (same as missing id).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PaymentIdPath'
 *     responses:
 *       '200':
 *         description: Payment detail.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 */

export {};
