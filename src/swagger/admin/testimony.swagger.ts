/**
 * @swagger
 * /admin/testimony:
 *   get:
 *     summary: Get all testimonies
 *     description: Retrieve paginated list of testimonies
 *     tags: [Admin Testimonies]
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
 *         name: isFlagged
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Testimonies retrieved successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/testimony/details/{id}:
 *   get:
 *     summary: Get testimony details
 *     description: Retrieve detailed information about a specific testimony
 *     tags: [Admin Testimonies]
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
 *         description: Testimony retrieved successfully
 *       404:
 *         description: Testimony not found
 */

/**
 * @swagger
 * /admin/testimony/flag/{id}:
 *   post:
 *     summary: Flag testimony
 *     description: Flag a testimony as inappropriate
 *     tags: [Admin Testimonies]
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
 *         description: Testimony flagged successfully
 *       404:
 *         description: Testimony not found
 */

/**
 * @swagger
 * /admin/testimony/unflag/{id}:
 *   post:
 *     summary: Unflag testimony
 *     description: Remove flag from a testimony
 *     tags: [Admin Testimonies]
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
 *         description: Testimony unflagged successfully
 *       404:
 *         description: Testimony not found
 */

/**
 * @swagger
 * /admin/testimony/flagged:
 *   get:
 *     summary: Get flagged testimonies
 *     description: Retrieve all flagged testimonies
 *     tags: [Admin Testimonies]
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
 *         description: Flagged testimonies retrieved successfully
 */

/**
 * @swagger
 * /admin/testimony/highest-engagement:
 *   get:
 *     summary: Get testimonies with highest engagement
 *     description: Retrieve testimonies with the most likes, replies, and views
 *     tags: [Admin Testimonies]
 *     security:
 *       - AdminApiKey: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Most engaged testimonies retrieved
 */

/**
 * @swagger
 * /admin/testimony/highest-likes:
 *   get:
 *     summary: Get testimonies with highest likes
 *     tags: [Admin Testimonies]
 *     security:
 *       - AdminApiKey: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Most liked testimonies retrieved
 */

/**
 * @swagger
 * /admin/testimony/highest-replies:
 *   get:
 *     summary: Get testimonies with highest replies
 *     tags: [Admin Testimonies]
 *     security:
 *       - AdminApiKey: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Most replied testimonies retrieved
 */

/**
 * @swagger
 * /admin/testimony/highest-views:
 *   get:
 *     summary: Get testimonies with highest views
 *     tags: [Admin Testimonies]
 *     security:
 *       - AdminApiKey: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Most viewed testimonies retrieved
 */

/**
 * @swagger
 * /admin/testimony/most-active-users:
 *   get:
 *     summary: Get most active users
 *     description: Retrieve users with most testimonies
 *     tags: [Admin Testimonies]
 *     security:
 *       - AdminApiKey: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Most active users retrieved
 */

/**
 * @swagger
 * /admin/testimony/most-engaged-users:
 *   get:
 *     summary: Get most engaged users
 *     description: Retrieve users with highest engagement on their testimonies
 *     tags: [Admin Testimonies]
 *     security:
 *       - AdminApiKey: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Most engaged users retrieved
 */
