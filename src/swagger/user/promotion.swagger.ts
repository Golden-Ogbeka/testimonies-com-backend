/**
 * @swagger
 * /user/promotion:
 *   get:
 *     summary: Get all active promotions
 *     description: Retrieve all active unflagged promotions targeting the user's demographic
 *     tags: [User Promotion]
 *     security:
 *       - ApiKey: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Promotions retrieved
 *   post:
 *     summary: Create a promotion request
 *     description: Request an admin to approve a new promotion
 *     tags: [User Promotion]
 *     security:
 *       - ApiKey: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - startDate
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               targetAudience:
 *                 type: string
 *                 enum: [all, premium, basic, organizations]
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *     responses:
 *       201:
 *         description: Promotion request created
 *
 * /user/promotion/requests/all:
 *   get:
 *     summary: Get all your promotion requests
 *     tags: [User Promotion]
 *     security:
 *       - ApiKey: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Promotion requests retrieved
 *
 * /user/promotion/view/ad:
 *   get:
 *     summary: Get a random active promotion ad
 *     tags: [User Promotion]
 *     security:
 *       - ApiKey: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Ad retrieved
 *       404:
 *         description: No ads found
 */
