/**
 * @swagger
 * /user/team/members:
 *   get:
 *     summary: Get all team members
 *     description: Organizations can get their team members
 *     tags: [User Team]
 *     security:
 *       - ApiKey: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Team members retrieved
 *   post:
 *     summary: Add a team member
 *     tags: [User Team]
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
 *               - email
 *               - roleId
 *             properties:
 *               email:
 *                 type: string
 *               roleId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Team member added
 *
 * /user/team/members/{id}:
 *   put:
 *     summary: Update a team member
 *     tags: [User Team]
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
 *               roleId:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Member updated
 *   delete:
 *     summary: Remove a team member
 *     tags: [User Team]
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
 *         description: Member removed
 *
 * /user/team/roles:
 *   get:
 *     summary: Get team roles
 *     tags: [User Team]
 *     security:
 *       - ApiKey: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Roles retrieved
 *   post:
 *     summary: Create a team role
 *     tags: [User Team]
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
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Role created
 */
