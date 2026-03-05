/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Get profile information
 *     tags: [User Profile]
 *     security:
 *       - ApiKey: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data
 *   put:
 *     summary: Update profile
 *     tags: [User Profile]
 *     security:
 *       - ApiKey: []
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               bio: { type: string }
 *               profileVisibility: { type: string, enum: [public, private, secret] }
 *     responses:
 *       200:
 *         description: Profile updated
 */
