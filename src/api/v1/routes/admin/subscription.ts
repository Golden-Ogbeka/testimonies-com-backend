import { Router } from "express";
import { body, param, query } from "express-validator";
import { isAdmin, isSuperAdmin } from "../../../../middleware/auth";
import { isValidObjectId } from "../../../../middleware/validation";
import { AdminSubscriptionController } from "../../controllers/admin/subscription";

const AdminSubscriptionRouter = Router();
const Controller = AdminSubscriptionController();

// Get all subscription plans
AdminSubscriptionRouter.get(
  "/",
  [
    isAdmin,
    query("page", "Page must be a number").optional().isNumeric(),
    query("limit", "Limit must be a number").optional().isNumeric(),
    query("isActive", "isActive must be boolean")
      .optional()
      .isBoolean()
      .toBoolean(),
    query("billingCycle", "Billing cycle is required")
      .optional()
      .isIn(["monthly", "yearly", "quarterly"]),
  ],
  Controller.GetAllPlans,
);

// Create a new subscription plan (contains app constraints like text limits, media limits, etc.)
AdminSubscriptionRouter.post(
  "/",
  [
    isSuperAdmin,
    body("name", "Plan name is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 2 })
      .withMessage("Plan name must be at least 2 characters long"),
    body("description", "Description is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 5 })
      .withMessage("Description must be at least 5 characters long"),
    body("price", "Price is required")
      .exists({ checkFalsy: true, checkNull: true })
      .isNumeric()
      .withMessage("Price must be a number"),
    body("currency", "Currency is required")
      .optional()
      .isLength({ min: 3, max: 3 })
      .withMessage("Currency must be a 3-letter code"),
    body("billingCycle", "Billing cycle is required")
      .exists({ checkFalsy: true, checkNull: true })
      .isIn(["monthly", "yearly", "quarterly"]),
    body("features", "Features must be an array").optional().isArray(),
    body("trialDays", "Trial days must be a number").optional().isNumeric(),
    body("maxUsers", "Max users must be a number").optional().isNumeric(),
    body("maxTestimonies", "Max testimonies must be a number")
      .optional()
      .isNumeric(),
  ],
  Controller.CreatePlan,
);

// Update an existing subscription plan
AdminSubscriptionRouter.put(
  "/:id",
  [
    isSuperAdmin,
    param("id", "Subscription plan ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
    body("name", "Plan name is required")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Plan name must be at least 2 characters long"),
    body("description", "Description is required")
      .optional()
      .trim()
      .isLength({ min: 5 })
      .withMessage("Description must be at least 5 characters long"),
    body("price", "Price is required")
      .optional()
      .isNumeric()
      .withMessage("Price must be a number"),
    body("currency", "Currency is required")
      .optional()
      .isLength({ min: 3, max: 3 })
      .withMessage("Currency must be a 3-letter code"),
    body("billingCycle", "Billing cycle is required")
      .optional()
      .isIn(["monthly", "yearly", "quarterly"]),
    body("features", "Features must be an array").optional().isArray(),
    body("isActive", "isActive must be boolean")
      .optional()
      .isBoolean()
      .toBoolean(),
    body("trialDays", "Trial days must be a number").optional().isNumeric(),
    body("maxUsers", "Max users must be a number").optional().isNumeric(),
    body("maxTestimonies", "Max testimonies must be a number")
      .optional()
      .isNumeric(),
  ],
  Controller.UpdatePlan,
);

// Deactivate a subscription plan
AdminSubscriptionRouter.post(
  "/deactivate/:id",
  [
    isSuperAdmin,
    param("id", "Subscription plan ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.DeactivatePlan,
);

// Activate a subscription plan
AdminSubscriptionRouter.post(
  "/activate/:id",
  [
    isSuperAdmin,
    param("id", "Subscription plan ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.ActivatePlan,
);

// Get subscription plan by ID
AdminSubscriptionRouter.get(
  "/details/:id",
  [
    isAdmin,
    param("id", "Subscription plan ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.GetSinglePlan,
);

// Delete a subscription plan (only if no users are subscribed)
AdminSubscriptionRouter.delete(
  "/:id",
  [
    isSuperAdmin,
    param("id", "Subscription plan ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.DeletePlan,
);

// Get all users subscribed to a specific plan
AdminSubscriptionRouter.get(
  "/subscribed-users/:id",
  [
    isAdmin,
    param("id", "Subscription plan ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
    query("page", "Page must be a number").optional().isNumeric(),
    query("limit", "Limit must be a number").optional().isNumeric(),
  ],
  Controller.GetPlanSubscribedUsers,
);

// Get subscription statistics (total revenue, active subscriptions, cancellations, etc.)
AdminSubscriptionRouter.get(
  "/statistics/:id",
  [
    isAdmin,
    param("id", "Subscription plan ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.GetPlanStatistics,
);

// Extend a user's subscription
AdminSubscriptionRouter.post(
  "/extend-subscription/:subscriptionId",
  [
    isSuperAdmin,
    param("subscriptionId", "Subscription ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
    body("days", "Days to extend is required")
      .optional()
      .isNumeric()
      .withMessage("Days must be a number"),
  ],
  Controller.ExtendSubscription,
);

// Get user's subscription details by user ID
AdminSubscriptionRouter.get(
  "/user-subscription/:userId",
  [
    isAdmin,
    param("userId", "User ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.GetUserSubscription,
);

// Get all users with active subscriptions
AdminSubscriptionRouter.get(
  "/active-subscriptions",
  [
    isAdmin,
    query("page", "Page must be a number").optional().isNumeric(),
    query("limit", "Limit must be a number").optional().isNumeric(),
  ],
  Controller.GetActiveSubscriptions,
);

// Get all users with cancelled subscriptions
AdminSubscriptionRouter.get(
  "/cancelled-subscriptions",
  [
    isAdmin,
    query("page", "Page must be a number").optional().isNumeric(),
    query("limit", "Limit must be a number").optional().isNumeric(),
  ],
  Controller.GetCancelledSubscriptions,
);

// Get all users without any subscriptions
AdminSubscriptionRouter.get(
  "/unsubscribed-users",
  [
    isAdmin,
    query("page", "Page must be a number").optional().isNumeric(),
    query("limit", "Limit must be a number").optional().isNumeric(),
  ],
  Controller.GetUnsubscribedUsers,
);

export default AdminSubscriptionRouter;
