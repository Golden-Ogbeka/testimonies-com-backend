import { Router } from "express";
import { AdminSubscriptionController } from "../../controllers/admin/subscription";

const AdminSubscriptionRouter = Router();
const Controller = AdminSubscriptionController();

// Get all subscription plans

// Create a new subscription plan (contains app constraints like text limits, media limits, etc.)

// Update an existing subscription plan

// Deactivate a subscription plan

// Activate a subscription plan

// Get subscription plan by ID

// Delete a subscription plan (only if no users are subscribed)

// Get all users subscribed to a specific plan

// Get subscription statistics (total revenue, active subscriptions, cancellations, etc.)

// Get subscription transactions

// Get single subscription transaction by ID

// Refund a subscription transaction

// Cancel a user's subscription

// Extend a user's subscription

// Get user's subscription details by user ID

// Get all users with active subscriptions

// Get all users with cancelled subscriptions

// Get all users without any subscriptions

export default AdminSubscriptionRouter;
