/**
 * @swagger
 * components:
 *   schemas:
 *     SubscriptionPlan:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         currency:
 *           type: string
 *           default: NGN
 *         billingCycle:
 *           type: string
 *           enum: [monthly, yearly, quarterly]
 *         features:
 *           type: array
 *           items:
 *             type: string
 *         trialDays:
 *           type: number
 *         maxUsers:
 *           type: number
 *         maxTestimonies:
 *           type: number
 *         isActive:
 *           type: boolean
 */

/**
 * @swagger
 * /admin/subscription/plans:
 *   get:
 *     summary: Get all subscription plans
 *     tags: [Admin Subscriptions]
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
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: billingCycle
 *         schema:
 *           type: string
 *           enum: [monthly, yearly, quarterly]
 *     responses:
 *       200:
 *         description: Subscription plans retrieved
 *
 *   post:
 *     summary: Create subscription plan
 *     tags: [Admin Subscriptions]
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
 *               - price
 *               - billingCycle
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               currency:
 *                 type: string
 *               billingCycle:
 *                 type: string
 *                 enum: [monthly, yearly, quarterly]
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               trialDays:
 *                 type: number
 *               maxUsers:
 *                 type: number
 *               maxTestimonies:
 *                 type: number
 *     responses:
 *       200:
 *         description: Plan created successfully
 *       409:
 *         description: Plan with this name already exists
 */

/**
 * @swagger
 * /admin/subscription/plans/{id}:
 *   get:
 *     summary: Get single subscription plan
 *     tags: [Admin Subscriptions]
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
 *         description: Plan retrieved successfully
 *       404:
 *         description: Plan not found
 *
 *   put:
 *     summary: Update subscription plan
 *     tags: [Admin Subscriptions]
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
 *             $ref: '#/components/schemas/SubscriptionPlan'
 *     responses:
 *       200:
 *         description: Plan updated successfully
 *
 *   delete:
 *     summary: Delete subscription plan
 *     tags: [Admin Subscriptions]
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
 *         description: Plan deleted successfully
 *       400:
 *         description: Cannot delete plan with active subscriptions
 */

/**
 * @swagger
 * /admin/subscription/plans/{id}/activate:
 *   put:
 *     summary: Activate subscription plan
 *     tags: [Admin Subscriptions]
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
 *         description: Plan activated successfully
 */

/**
 * @swagger
 * /admin/subscription/plans/{id}/deactivate:
 *   put:
 *     summary: Deactivate subscription plan
 *     tags: [Admin Subscriptions]
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
 *         description: Plan deactivated successfully
 */

/**
 * @swagger
 * /admin/subscription/plans/{id}/subscribers:
 *   get:
 *     summary: Get plan subscribers
 *     tags: [Admin Subscriptions]
 *     security:
 *       - AdminApiKey: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *         description: Subscribers retrieved successfully
 */

/**
 * @swagger
 * /admin/subscription/plans/{id}/statistics:
 *   get:
 *     summary: Get plan statistics
 *     tags: [Admin Subscriptions]
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
 *         description: Statistics retrieved successfully
 */

/**
 * @swagger
 * /admin/subscription/{subscriptionId}/extend:
 *   put:
 *     summary: Extend subscription
 *     tags: [Admin Subscriptions]
 *     security:
 *       - AdminApiKey: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
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
 *               - days
 *             properties:
 *               days:
 *                 type: number
 *     responses:
 *       200:
 *         description: Subscription extended successfully
 */

/**
 * @swagger
 * /admin/subscription/user/{userId}:
 *   get:
 *     summary: Get user subscription
 *     tags: [Admin Subscriptions]
 *     security:
 *       - AdminApiKey: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User subscription retrieved
 *       404:
 *         description: Subscription not found
 */

/**
 * @swagger
 * /admin/subscription/active:
 *   get:
 *     summary: Get active subscriptions
 *     tags: [Admin Subscriptions]
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
 *         description: Active subscriptions retrieved
 */

/**
 * @swagger
 * /admin/subscription/cancelled:
 *   get:
 *     summary: Get cancelled subscriptions
 *     tags: [Admin Subscriptions]
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
 *         description: Cancelled subscriptions retrieved
 */

/**
 * @swagger
 * /admin/subscription/unsubscribed-users:
 *   get:
 *     summary: Get unsubscribed users
 *     tags: [Admin Subscriptions]
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
 *         description: Unsubscribed users retrieved
 */
