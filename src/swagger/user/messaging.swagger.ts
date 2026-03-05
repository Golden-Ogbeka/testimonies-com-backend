/**
 * @swagger
 * /user/messaging/conversations:
 *   get:
 *     summary: Get all conversations
 *     description: Retrieve conversation history of the user
 *     tags: [User Messaging]
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
 *         description: Conversations retrieved
 *
 * /user/messaging/conversations/{conversationId}:
 *   get:
 *     summary: Get messages in a conversation
 *     tags: [User Messaging]
 *     security:
 *       - ApiKey: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Messages retrieved
 *
 * /user/messaging/send:
 *   post:
 *     summary: Send a message
 *     tags: [User Messaging]
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
 *               - recipientId
 *               - recipientType
 *               - content
 *             properties:
 *               recipientId:
 *                 type: string
 *               recipientType:
 *                 type: string
 *                 enum: [user, organization]
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent
 *
 * /user/messaging/search:
 *   get:
 *     summary: Search across all messages
 *     tags: [User Messaging]
 *     security:
 *       - ApiKey: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 */
