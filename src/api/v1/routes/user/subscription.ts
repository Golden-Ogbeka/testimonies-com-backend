import { Router } from "express";
import { param } from "express-validator";
import { isValidObjectId } from "../../../../middleware/validation";
import { UserSubscriptionController } from "../../controllers/user/subscription";

const UserSubscriptionRouter = Router();
const Controller = UserSubscriptionController();

// Get subscription plans
UserSubscriptionRouter.get("/plans", Controller.GetSubscriptionPlans);

// Get single subscription plan details
UserSubscriptionRouter.get(
  "/plans/:id",
  param("id", "Plan ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetSubscriptionPlan,
);

// Subscribe to a plan
UserSubscriptionRouter.post("/subscribe", Controller.Subscribe as any);

// Pay for subscription plan
UserSubscriptionRouter.post("/pay", Controller.PayForSubscription as any);

// Verify subscription payment
UserSubscriptionRouter.post("/verify-payment", Controller.VerifyPayment as any);

// Cancel subscription
UserSubscriptionRouter.post("/cancel", Controller.CancelSubscription as any);

// Get user's current subscription status
UserSubscriptionRouter.get("/status", Controller.GetSubscriptionStatus as any);

// Get user's subscription history
UserSubscriptionRouter.get(
  "/history",
  Controller.GetSubscriptionHistory as any,
);

export default UserSubscriptionRouter;
