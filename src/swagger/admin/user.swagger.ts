/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         username:
 *           type: string
 *         profileImage:
 *           type: string
 *         active:
 *           type: boolean
 *         isFlagged:
 *           type: boolean
 *         accountType:
 *           type: string
 *         subscriptionType:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /admin/user:
 *   get:
 *     summary: Get all users
 *     description: Retrieve paginated list of users with optional filters
 *     tags: [Admin Users]
 *     security:
 *       - AdminApiKey: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: isFlagged
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: accountType
 *         schema:
 *           type: string
 *       - in: query
 *         name: subscriptionType
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/user/details/{id}:
 *   get:
 *     summary: Get single user
 *     description: Retrieve detailed information about a specific user
 *     tags: [Admin Users]
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
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /admin/user/{id}:
 *   patch:
 *     summary: Update user
 *     description: Update user information
 *     tags: [Admin Users]
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
 *             properties:
 *               isFlagged:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /admin/user/deactivate/{id}:
 *   post:
 *     summary: Deactivate user
 *     description: Deactivate a user account
 *     tags: [Admin Users]
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
 *         description: User deactivated successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /admin/user/activate/{id}:
 *   post:
 *     summary: Activate user
 *     description: Activate a user account
 *     tags: [Admin Users]
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
 *         description: User activated successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /admin/user/profile-stats:
 *   get:
 *     summary: Get all users statistics
 *     description: Retrieve overall user statistics
 *     tags: [Admin Users]
 *     security:
 *       - AdminApiKey: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: number
 *                     activeUsers:
 *                       type: number
 *                     flaggedUsers:
 *                       type: number
 *                     verifiedUsers:
 *                       type: number
 */

/**
 * @swagger
 * /admin/user/profile-stats/user/{id}:
 *   get:
 *     summary: Get user statistics
 *     description: Retrieve statistics for a specific user
 *     tags: [Admin Users]
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
 *         description: User statistics retrieved successfully
 *       404:
 *         description: User not found
 */
