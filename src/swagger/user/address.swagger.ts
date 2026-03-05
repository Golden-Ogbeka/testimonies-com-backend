/**
 * @swagger
 * /user/address:
 *   get:
 *     summary: Get user addresses
 *     tags: [User Address]
 *     security:
 *       - ApiKey: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Addresses retrieved
 *   post:
 *     summary: Add an address
 *     tags: [User Address]
 *     security:
 *       - ApiKey: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [street, city, state, country]
 *             properties:
 *               street: { type: string }
 *               city: { type: string }
 *               state: { type: string }
 *               postalCode: { type: string }
 *               country: { type: string }
 *     responses:
 *       201:
 *         description: Address created
 */
