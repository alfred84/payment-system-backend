/**
 * @openapi
 * /cards:
 *   post:
 *     tags: [Cards]
 *     summary: Register a tokenized card
 *     description: |
 *       Tokenizes card data via the internal processor. Only **last4**, **brand**, and an opaque
 *       **token** are stored — full PAN and CVV are never persisted. `userId` identifies the owner.
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
 *                 userId: 11111111-1111-4111-8111-111111111111
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
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 *   get:
 *     tags: [Cards]
 *     summary: List active cards for a user
 *     description: Returns all **active** cards owned by `user_id` (soft-deleted cards excluded).
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdQuery'
 *     responses:
 *       '200':
 *         description: Card list.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CardListResponse'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 *
 * /cards/{id}:
 *   delete:
 *     tags: [Cards]
 *     summary: Soft-delete a card
 *     description: |
 *       Deactivates a card when it belongs to `user_id`. Returns `404` if the card does not
 *       exist or belongs to another user (no resource enumeration).
 *     parameters:
 *       - $ref: '#/components/parameters/CardIdPath'
 *       - $ref: '#/components/parameters/UserIdQuery'
 *     responses:
 *       '204':
 *         description: Card soft-deleted; no response body.
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 */

export {};
