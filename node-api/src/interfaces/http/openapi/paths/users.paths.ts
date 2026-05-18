/**
 * @openapi
 * /users:
 *   post:
 *     tags: [Users]
 *     summary: Create a new user
 *     description: |
 *       Creates a user with `fullName` and `email`. Returns `409` if the email already exists.
 *       No password or authentication credentials are involved.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *           examples:
 *             default:
 *               value:
 *                 fullName: Ada Lovelace
 *                 email: ada.lovelace@example.com
 *     responses:
 *       '201':
 *         description: User created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *             examples:
 *               success:
 *                 value:
 *                   id: 11111111-1111-4111-8111-111111111111
 *                   fullName: Ada Lovelace
 *                   email: ada.lovelace@example.com
 *                   createdAt: '2026-05-16T12:00:00.000Z'
 *                   updatedAt: '2026-05-16T12:00:00.000Z'
 *       '409':
 *         $ref: '#/components/responses/Conflict'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 *   get:
 *     tags: [Users]
 *     summary: List all users
 *     description: Returns all registered users ordered by creation date descending.
 *     responses:
 *       '200':
 *         description: User list.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserResponse'
 *                 count:
 *                   type: integer
 *
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get a user by id
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdPath'
 *     responses:
 *       '200':
 *         description: User detail.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 */

export {};
