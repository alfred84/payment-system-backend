/**
 * @openapi
 * /cards:
 *   post:
 *     tags: [Cards]
 *     summary: Register a tokenized card
 *     description: |
 *       Tokenizes card data via the internal processor. Only **last4**, **brand**, and an opaque
 *       **token** are stored — full PAN and CVV are never persisted.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterCardRequest'
 *           examples:
 *             visa:
 *               summary: Visa test card
 *               value:
 *                 cardholderName: Ada Lovelace
 *                 cardNumber: '4242424242424242'
 *                 expiryMonth: 12
 *                 expiryYear: 2030
 *                 cvv: '123'
 *     responses:
 *       '201':
 *         description: Card registered and active.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CardResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 *   get:
 *     tags: [Cards]
 *     summary: List active cards
 *     description: Returns all **active** cards owned by the authenticated user (soft-deleted cards excluded).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Card list.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CardListResponse'
 *             examples:
 *               success:
 *                 value:
 *                   data:
 *                     - id: 22222222-2222-4222-8222-222222222222
 *                       cardholderName: Ada Lovelace
 *                       last4: '4242'
 *                       brand: VISA
 *                       expiryMonth: 12
 *                       expiryYear: 2030
 *                       maskedPan: '**** **** **** 4242'
 *                       createdAt: '2026-05-16T12:00:00.000Z'
 *                   count: 1
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /cards/{id}:
 *   delete:
 *     tags: [Cards]
 *     summary: Soft-delete a card
 *     description: |
 *       Deactivates a card owned by the caller. Returns `404` if the card does not exist or belongs
 *       to another user (no resource enumeration).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/CardIdPath'
 *     responses:
 *       '204':
 *         description: Card soft-deleted; no response body.
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 */

export {};
