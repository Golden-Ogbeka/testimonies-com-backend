/**
 * @swagger
 * /user/auth/signup:
 *   post:
 *     summary: User Signup
 *     tags: [User Auth]
 *     security:
 *       - ApiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName, username, phoneNumber]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               username: { type: string }
 *               phoneNumber: { type: string }
 *     responses:
 *       201:
 *         description: Signup successful
 *
 * /user/auth/login:
 *   post:
 *     summary: User Login
 *     tags: [User Auth]
 *     security:
 *       - ApiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 *
 * /user/auth/logout:
 *   post:
 *     summary: User Logout
 *     tags: [User Auth]
 *     security:
 *       - ApiKey: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out
 */
