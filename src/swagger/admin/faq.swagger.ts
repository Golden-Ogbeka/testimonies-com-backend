/**
 * @swagger
 * /admin/faq:
 *   post:
 *     summary: Create a new FAQ
 *     description: Admins can create new FAQs
 *     tags: [Admin FAQ]
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
 *               - question
 *               - answer
 *             properties:
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *               order:
 *                 type: number
 *     responses:
 *       201:
 *         description: FAQ created successfully
 *   get:
 *     summary: Get all FAQs
 *     tags: [Admin FAQ]
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
 *         description: FAQs retrieved successfully
 *
 * /admin/faq/{id}:
 *   put:
 *     summary: Update an FAQ
 *     tags: [Admin FAQ]
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
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *               order:
 *                 type: number
 *     responses:
 *       200:
 *         description: FAQ updated successfully
 *   delete:
 *     summary: Delete an FAQ
 *     tags: [Admin FAQ]
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
 *         description: FAQ deleted successfully
 *
 * /admin/faq/{id}/status:
 *   patch:
 *     summary: Toggle FAQ status
 *     tags: [Admin FAQ]
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
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Status updated
 */
