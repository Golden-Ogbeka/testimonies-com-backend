/**
 * @swagger
 * /admin/data-management/faq:
 *   get:
 *     summary: Get all FAQs
 *     tags: [Admin Data Management]
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
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: FAQs retrieved successfully
 *
 *   post:
 *     summary: Create FAQ
 *     tags: [Admin Data Management]
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
 *       200:
 *         description: FAQ created successfully
 *       409:
 *         description: FAQ already exists
 */

/**
 * @swagger
 * /admin/data-management/faq/{id}:
 *   get:
 *     summary: Get single FAQ
 *     tags: [Admin Data Management]
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
 *         description: FAQ retrieved successfully
 *       404:
 *         description: FAQ not found
 *
 *   put:
 *     summary: Update FAQ
 *     tags: [Admin Data Management]
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
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: FAQ updated successfully
 *
 *   delete:
 *     summary: Delete FAQ
 *     tags: [Admin Data Management]
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
 */

/**
 * @swagger
 * /admin/data-management/privacy-policy:
 *   get:
 *     summary: Get privacy policy
 *     tags: [Admin Data Management]
 *     security:
 *       - AdminApiKey: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Privacy policy retrieved
 *       404:
 *         description: Privacy policy not found
 *
 *   put:
 *     summary: Update privacy policy
 *     tags: [Admin Data Management]
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
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               version:
 *                 type: string
 *     responses:
 *       200:
 *         description: Privacy policy updated successfully
 */

/**
 * @swagger
 * /admin/data-management/terms-of-service:
 *   get:
 *     summary: Get terms of service
 *     tags: [Admin Data Management]
 *     security:
 *       - AdminApiKey: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Terms of service retrieved
 *       404:
 *         description: Terms of service not found
 *
 *   put:
 *     summary: Update terms of service
 *     tags: [Admin Data Management]
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
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               version:
 *                 type: string
 *     responses:
 *       200:
 *         description: Terms of service updated successfully
 */

/**
 * @swagger
 * /admin/data-management/community-guidelines:
 *   get:
 *     summary: Get community guidelines
 *     tags: [Admin Data Management]
 *     security:
 *       - AdminApiKey: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Community guidelines retrieved
 *       404:
 *         description: Community guidelines not found
 *
 *   put:
 *     summary: Update community guidelines
 *     tags: [Admin Data Management]
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
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               version:
 *                 type: string
 *     responses:
 *       200:
 *         description: Community guidelines updated successfully
 */

/**
 * @swagger
 * /admin/data-management/team-permissions:
 *   get:
 *     summary: Get all team permissions
 *     tags: [Admin Data Management]
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
 *         description: Team permissions retrieved
 *
 *   post:
 *     summary: Create team permission
 *     tags: [Admin Data Management]
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
 *               - permission
 *               - description
 *             properties:
 *               permission:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Team permission created successfully
 *       400:
 *         description: Permission already exists
 */

/**
 * @swagger
 * /admin/data-management/team-permissions/{id}:
 *   get:
 *     summary: Get single team permission
 *     tags: [Admin Data Management]
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
 *         description: Team permission retrieved
 *       404:
 *         description: Team permission not found
 *
 *   put:
 *     summary: Update team permission
 *     tags: [Admin Data Management]
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
 *               permission:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Team permission updated successfully
 *
 *   delete:
 *     summary: Delete team permission
 *     tags: [Admin Data Management]
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
 *         description: Team permission deleted successfully
 */
