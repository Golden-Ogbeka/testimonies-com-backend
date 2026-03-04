/**
 * @swagger
 * /admin/promotion:
 *   get:
 *     summary: Get all promotions
 *     tags: [Admin Promotions]
 *     security:
 *       - AdminApiKey: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [discount, offer, announcement, feature]
 *       - in: query
 *         name: targetAudience
 *         schema:
 *           type: string
 *           enum: [all, premium, basic, organizations]
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: isFlagged
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Promotions retrieved successfully
 *
 *   post:
 *     summary: Create promotion
 *     tags: [Admin Promotions]
 *     security:
 *       - AdminApiKey: []
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
 *               - type
 *               - startDate
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [discount, offer, announcement, feature]
 *               targetAudience:
 *                 type: string
 *                 enum: [all, premium, basic, organizations]
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Promotion created successfully
 */

/**
 * @swagger
 * /admin/promotion/{id}:
 *   get:
 *     summary: Get single promotion
 *     tags: [Admin Promotions]
 *     security:
 *       - AdminApiKey: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Promotion retrieved successfully
 *       404:
 *         description: Promotion not found
 *
 *   put:
 *     summary: Update promotion
 *     tags: [Admin Promotions]
 *     security:
 *       - AdminApiKey: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *               targetAudience:
 *                 type: string
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Promotion updated successfully
 */

/**
 * @swagger
 * /admin/promotion/{id}/activate:
 *   put:
 *     summary: Activate promotion
 *     tags: [Admin Promotions]
 *     security:
 *       - AdminApiKey: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Promotion activated successfully
 */

/**
 * @swagger
 * /admin/promotion/{id}/deactivate:
 *   put:
 *     summary: Deactivate promotion
 *     tags: [Admin Promotions]
 *     security:
 *       - AdminApiKey: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Promotion deactivated successfully
 */

/**
 * @swagger
 * /admin/promotion/{id}/flag:
 *   put:
 *     summary: Flag promotion
 *     tags: [Admin Promotions]
 *     security:
 *       - AdminApiKey: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Promotion flagged successfully
 */

/**
 * @swagger
 * /admin/promotion/{id}/unflag:
 *   put:
 *     summary: Unflag promotion
 *     tags: [Admin Promotions]
 *     security:
 *       - AdminApiKey: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Promotion unflagged successfully
 */

/**
 * @swagger
 * /admin/promotion/flagged:
 *   get:
 *     summary: Get flagged promotions
 *     tags: [Admin Promotions]
 *     security:
 *       - AdminApiKey: []
 *       - BearerAuth: []
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
 *         description: Flagged promotions retrieved
 */
