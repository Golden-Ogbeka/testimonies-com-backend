import { Router } from "express";
import { param } from "express-validator";
import { isValidObjectId } from "../../../../middleware/validation";
import { AdminSubscriptionController } from "../../controllers/admin/subscription";

const AdminSubscriptionRouter = Router();
const Controller = AdminSubscriptionController();

// Get all subscription plans
AdminSubscriptionRouter.get("/", Controller.GetAllPlans);

// Create a new subscription plan (contains app constraints like text limits, media limits, etc.)
AdminSubscriptionRouter.post("/", Controller.CreatePlan);

// Update an existing subscription plan
AdminSubscriptionRouter.put(
  "/:id",
  param("id", "Subscription plan ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.UpdatePlan,
);

// Deactivate a subscription plan
AdminSubscriptionRouter.post(
  "/deactivate/:id",
  param("id", "Subscription plan ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.DeactivatePlan,
);

// Activate a subscription plan
AdminSubscriptionRouter.post(
  "/activate/:id",
  param("id", "Subscription plan ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.ActivatePlan,
);

// Get subscription plan by ID
AdminSubscriptionRouter.put(
  "/details/:id",
  param("id", "Subscription plan ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetSinglePlan,
);

// Delete a subscription plan (only if no users are subscribed)
AdminSubscriptionRouter.delete(
  "/:id",
  param("id", "Subscription plan ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.DeletePlan,
);

// Get all users subscribed to a specific plan
AdminSubscriptionRouter.get(
  "/subscribed-users/:id",
  param("id", "Subscription plan ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetPlanSubscribedUsers,
);

// Get subscription statistics (total revenue, active subscriptions, cancellations, etc.)
AdminSubscriptionRouter.get(
  "/statistics/:id",
  param("id", "Subscription plan ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetPlanStatistics,
);

// Get subscription transactions
AdminSubscriptionRouter.get(
  "/transactions/:id",
  param("id", "Subscription plan ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetPlanTransactions,
);

// Get single subscription transaction by ID
AdminSubscriptionRouter.get(
  "/transaction/:transactionId",
  param("transactionId", "Transaction ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetPlanTransactionDetails,
);

// Refund a subscription transaction
AdminSubscriptionRouter.get(
  "/refund-transaction/:transactionId",
  param("transactionId", "Transaction ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.RefundTransaction,
);

// Cancel a user's subscription
AdminSubscriptionRouter.get(
  "/cancel-transaction/:transactionId",
  param("transactionId", "Transaction ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.CancelTransaction,
);

// Extend a user's subscription
AdminSubscriptionRouter.get(
  "/extend-subscription/:subscriptionId",
  param("subscriptionId", "Subscription ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.ExtendSubscription,
);

// Get user's subscription details by user ID
AdminSubscriptionRouter.get(
  "/user-subscription/:userId",
  param("userId", "User ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetUserSubscription,
);

// Get all users with active subscriptions
AdminSubscriptionRouter.get("/active-subscriptions", Controller.GetActiveSubscriptions);

// Get all users with cancelled subscriptions
AdminSubscriptionRouter.get("/cancelled-subscriptions", Controller.GetCancelledSubscriptions);

// Get all users without any subscriptions
AdminSubscriptionRouter.get("/unsubscribed-users", Controller.GetUnsubscribedUsers);

export default AdminSubscriptionRouter;
