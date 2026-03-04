/**
 * @swagger
 * components:
 *   schemas:
 *     AuditLog:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         adminId:
 *           type: string
 *         userId:
 *           type: string
 *         action:
 *           type: string
 *           example: LOGIN_SUCCESS
 *         userType:
 *           type: string
 *           enum: [admin, user, organization]
 *         details:
 *           type: object
 *         ipAddress:
 *           type: string
 *         userAgent:
 *           type: string
 *         level:
 *           type: string
 *           enum: [info, warning, error, critical]
 *         category:
 *           type: string
 *           enum: [auth, user, testimony, system, data, security]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /admin/audit-log:
 *   get:
 *     summary: Get all audit logs
 *     description: Retrieve paginated audit logs with optional filters
 *     tags: [Admin Audit Logs]
 *     security:
 *       - AdminApiKey: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [auth, user, testimony, system, data, security]
 *         description: Filter by category
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [info, warning, error, critical]
 *         description: Filter by level
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs until this date
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     auditLogs:
 *                       type: object
 *                       properties:
 *                         docs:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/AuditLog'
 *                         totalDocs:
 *                           type: number
 *                         limit:
 *                           type: number
 *                         page:
 *                           type: number
 *                         totalPages:
 *                           type: number
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/audit-log/details/{id}:
 *   get:
 *     summary: Get single audit log
 *     description: Retrieve detailed information about a specific audit log
 *     tags: [Admin Audit Logs]
 *     security:
 *       - AdminApiKey: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Audit log ID
 *     responses:
 *       200:
 *         description: Audit log retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     auditLog:
 *                       $ref: '#/components/schemas/AuditLog'
 *       404:
 *         description: Audit log not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/audit-log/admin-logs/{adminId}:
 *   get:
 *     summary: Get admin audit logs
 *     description: Retrieve all audit logs for a specific admin
 *     tags: [Admin Audit Logs]
 *     security:
 *       - AdminApiKey: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID
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
 *     responses:
 *       200:
 *         description: Admin audit logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     auditLogs:
 *                       type: object
 *                       properties:
 *                         docs:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/AuditLog'
 *       401:
 *         description: Unauthorized
 */
