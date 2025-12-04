import { Router } from "express";
import { UserPromotionController } from "../../controllers/user/promotion";

const UserPromotionRouter = Router();
const Controller = UserPromotionController();

// Get all promotions (filter by active/inactive)

// Get a single promotion by ID

// Create a new promotion (this submits a promotion request for admin approval)

// Update an existing promotion

// Deactivate a promotion

// Activate a promotion

// Delete a promotion created by the user

// View promotion requests

// Delete promotion request

// Get user's promotion statistics (views, clicks, conversions, etc.)

// Get a promotion to view for advertising

export default UserPromotionRouter;
