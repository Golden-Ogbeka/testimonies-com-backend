/**
 * @swagger
 * /user/subscription/plans:
 *   get:
 *     summary: Get all subscription plans
 *     description: Retrieve all active subscription plans sorted by price
 *     tags: [User Subscription]
 *     security:
 *       - ApiKey: []
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
 *         description: Plans retrieved
 *
 * /user/subscription/subscribe:
 *   post:
 *     summary: Initiate a subscription
 *     tags: [User Subscription]
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
 *               - planId
 *             properties:
 *               planId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Subscription initialized
 *
 * /user/subscription/pay:
 *   post:
 *     summary: Pay for an initialized pending subscription
 *     tags: [User Subscription]
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
 *               - subscriptionId
 *               - paymentGateway
 *             properties:
 *               subscriptionId:
 *                 type: string
 *               paymentGateway:
 *                 type: string
 *                 enum: [stripe, paystack, flutterwave]
 *                 description: The external payment gateway to initialize the intent natively.
 *     responses:
 *       200:
 *         description: External Payment intent successfully initialized returning client secrets or checkout links
 *       400:
 *         description: Invalid generic parameters or payment status is already active
 *
 * /user/subscription/status:
 *   get:
 *     summary: Get current subscription status
 *     tags: [User Subscription]
 *     security:
 *       - ApiKey: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Status retrieved
 *
 * /user/subscription/history:
 *   get:
 *     summary: Get subscription history
 *     tags: [User Subscription]
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
 *         description: History retrieved
 *
 * /user/subscription/cancel:
 *   post:
 *     summary: Cancel current subscription
 *     tags: [User Subscription]
 *     security:
 *       - ApiKey: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription cancelled
 */
