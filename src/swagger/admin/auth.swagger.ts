/**
 * @swagger
 * components:
 *   schemas:
 *     AdminLoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: admin@testimonies.com
 *         password:
 *           type: string
 *           format: password
 *           example: Admin@123
 *
 *     AdminVerifyOTPRequest:
 *       type: object
 *       required:
 *         - email
 *         - otp
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         otp:
 *           type: string
 *           minLength: 6
 *           maxLength: 6
 *           example: "123456"
 *
 *     AdminProfile:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         email:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         role:
 *           type: string
 *           enum: [admin, super-admin]
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *         active:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /admin/auth/login:
 *   post:
 *     summary: Admin login
 *     description: Authenticate admin and send OTP to email
 *     tags: [Admin Auth]
 *     security:
 *       - AdminApiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminLoginRequest'
 *     responses:
 *       200:
 *         description: Login successful, OTP sent to email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful. Please verify OTP
 *                 data:
 *                   type: object
 *                   properties:
 *                     adminId:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Invalid or missing API key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /admin/auth/verify-otp:
 *   post:
 *     summary: Verify OTP and get JWT token
 *     description: Verify the OTP sent to admin email and receive JWT token
 *     tags: [Admin Auth]
 *     security:
 *       - AdminApiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminVerifyOTPRequest'
 *     responses:
 *       200:
 *         description: OTP verified successfully
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
 *                     token:
 *                       type: string
 *                       description: JWT token for authenticated requests
 *                     admin:
 *                       $ref: '#/components/schemas/AdminProfile'
 *       400:
 *         description: Invalid OTP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /admin/auth/resend-otp:
 *   post:
 *     summary: Resend OTP
 *     description: Resend OTP to admin email
 *     tags: [Admin Auth]
 *     security:
 *       - AdminApiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *       400:
 *         description: Admin not found
 */

/**
 * @swagger
 * /admin/auth/reset-password:
 *   post:
 *     summary: Request password reset
 *     description: Send password reset OTP to admin email
 *     tags: [Admin Auth]
 *     security:
 *       - AdminApiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset code sent
 *       400:
 *         description: Admin not found
 */

/**
 * @swagger
 * /admin/auth/reset-password/update:
 *   post:
 *     summary: Update password with reset code
 *     description: Reset admin password using OTP
 *     tags: [Admin Auth]
 *     security:
 *       - AdminApiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: Must contain uppercase, lowercase, number, and special character
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired reset token
 */

/**
 * @swagger
 * /admin/auth/change-password:
 *   post:
 *     summary: Change password
 *     description: Change admin password (requires authentication)
 *     tags: [Admin Auth]
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
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Current password is incorrect
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/auth/profile:
 *   get:
 *     summary: Get admin profile
 *     description: Retrieve authenticated admin profile
 *     tags: [Admin Auth]
 *     security:
 *       - AdminApiKey: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
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
 *                     admin:
 *                       $ref: '#/components/schemas/AdminProfile'
 *       401:
 *         description: Unauthorized
 *
 *   put:
 *     summary: Update admin profile
 *     description: Update authenticated admin profile information
 *     tags: [Admin Auth]
 *     security:
 *       - AdminApiKey: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/auth/logout:
 *   post:
 *     summary: Logout admin
 *     description: Invalidate admin session
 *     tags: [Admin Auth]
 *     security:
 *       - AdminApiKey: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */
