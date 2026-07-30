/**
 * @swagger
 * /user/testimony:
 *   get:
 *     summary: Get user testimonies feed
 *     tags: [User Testimony]
 *     security:
 *       - ApiKey: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [broadcast, normal]
 *     responses:
 *       200:
 *         description: Testimonies retrieved
 *
 * /user/testimony/by-user/{userId}:
 *   get:
 *     summary: Get testimonies by user (with privacy checks)
 *     tags: [User Testimony]
 *     security:
 *       - ApiKey: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User testimonies retrieved
 *       403:
 *         description: Cannot view this user's testimonies (blocked/private/secret)
 *       404:
 *         description: User not found
 *
 *   post:
 *     summary: Create newly published testimony
 *     tags: [User Testimony]
 *     security:
 *       - ApiKey: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content, tags]
 *             properties:
 *               title: { type: string }
 *               content: { type: string }
 *               tags: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Testimony created
 *
 * /user/testimony/{id}:
 *   get:
 *     summary: View testimony by ID
 *     tags: [User Testimony]
 *     security:
 *       - ApiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Testimony retrieved
 *   put:
 *     summary: Update a testimony
 *     tags: [User Testimony]
 *     security:
 *       - ApiKey: []
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
 *               title: { type: string }
 *               content: { type: string }
 *     responses:
 *       200:
 *         description: Update successful
 *   delete:
 *     summary: Delete a testimony
 *     tags: [User Testimony]
 *     security:
 *       - ApiKey: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delete successful
 */
