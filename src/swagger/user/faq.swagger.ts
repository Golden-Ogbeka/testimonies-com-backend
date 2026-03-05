/**
 * @swagger
 * /user/faq:
 *   get:
 *     summary: Get all active FAQs
 *     description: Users can view all active FAQs sorted by order
 *     tags: [User FAQ]
 *     security:
 *       - ApiKey: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Active FAQs retrieved successfully
 */
