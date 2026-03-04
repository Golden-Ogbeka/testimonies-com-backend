/**
 * @swagger
 * /admin/role-permission/permissions:
 *   get:
 *     summary: Get all permissions
 *     tags: [Admin Roles & Permissions]
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
 *         description: Permissions retrieved successfully
 *
 *   post:
 *     summary: Create permission
 *     tags: [Admin Roles & Permissions]
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
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Permission created successfully
 *       409:
 *         description: Permission already exists
 */

/**
 * @swagger
 * /admin/role-permission/permissions/{id}:
 *   get:
 *     summary: Get single permission
 *     tags: [Admin Roles & Permissions]
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
 *         description: Permission retrieved successfully
 *
 *   put:
 *     summary: Update permission
 *     tags: [Admin Roles & Permissions]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Permission updated successfully
 *
 *   delete:
 *     summary: Delete permission
 *     tags: [Admin Roles & Permissions]
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
 *         description: Permission deleted successfully
 */

/**
 * @swagger
 * /admin/role-permission/admins:
 *   get:
 *     summary: Get all admins
 *     tags: [Admin Roles & Permissions]
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
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, super-admin]
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Admins retrieved successfully
 *
 *   post:
 *     summary: Create admin
 *     tags: [Admin Roles & Permissions]
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
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               phoneNumber:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, super-admin]
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Admin created successfully
 *       409:
 *         description: Admin already exists
 */

/**
 * @swagger
 * /admin/role-permission/admins/{id}:
 *   get:
 *     summary: Get single admin
 *     tags: [Admin Roles & Permissions]
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
 *         description: Admin retrieved successfully
 *
 *   put:
 *     summary: Update admin
 *     tags: [Admin Roles & Permissions]
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
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin updated successfully
 */

/**
 * @swagger
 * /admin/role-permission/admins/{id}/role:
 *   put:
 *     summary: Update admin role
 *     tags: [Admin Roles & Permissions]
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
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, super-admin]
 *     responses:
 *       200:
 *         description: Admin role updated successfully
 */

/**
 * @swagger
 * /admin/role-permission/admins/{id}/permissions:
 *   put:
 *     summary: Update admin permissions
 *     tags: [Admin Roles & Permissions]
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
 *               - permissions
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Admin permissions updated successfully
 */

/**
 * @swagger
 * /admin/role-permission/admins/{id}/activate:
 *   put:
 *     summary: Activate admin
 *     tags: [Admin Roles & Permissions]
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
 *         description: Admin activated successfully
 */

/**
 * @swagger
 * /admin/role-permission/admins/{id}/deactivate:
 *   put:
 *     summary: Deactivate admin
 *     tags: [Admin Roles & Permissions]
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
 *         description: Admin deactivated successfully
 */
