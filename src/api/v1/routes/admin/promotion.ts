import { Router } from "express";
import { AdminPromotionController } from "../../controllers/admin/promotion";

const AdminPromotionRouter = Router();
const Controller = AdminPromotionController();

// Get all promotions (filter by active/inactive)

// Get a single promotion by ID

// Create a new promotion (this creates a promotion request for another admin's approval)

// Update an existing promotion

// Deactivate a promotion

// Activate a promotion

// Delete a promotion that was created by admin

// Flag user promotion

// Unflag user promotion

// Get all flagged user promotions

// Get promotion statistics (view, clicks, conversions, etc.)

// Get all promotions created by a specific user

// Get all promotion requests

// Approve promotion request

// Reject promotion request

// Get single promotion request by ID

export default AdminPromotionRouter;
