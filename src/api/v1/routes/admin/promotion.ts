import { Router } from "express";
import { body, param, query } from "express-validator";
import { isValidObjectId } from "../../../../middleware/validation";
import { AdminPromotionController } from "../../controllers/admin/promotion";

const AdminPromotionRouter = Router();
const Controller = AdminPromotionController();

// Get all promotions (filter by active/inactive)
AdminPromotionRouter.get(
  "/",
  [
    query("page", "Page must be a number").optional().isNumeric(),
    query("limit", "Limit must be a number").optional().isNumeric(),
    query("type", "Type is required")
      .optional()
      .isIn(["discount", "offer", "announcement", "feature"]),
    query("targetAudience", "Target audience is required")
      .optional()
      .isIn(["all", "premium", "basic", "organizations"]),
    query("isActive", "isActive must be boolean").optional().isBoolean(),
    query("isFlagged", "isFlagged must be boolean").optional().isBoolean(),
  ],
  Controller.GetAllPromotions,
);

// Get a single promotion by ID
AdminPromotionRouter.get(
  "/details/:id",
  param("id", "ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetSinglePromotion,
);

// Create a new promotion (this creates a promotion request for another admin's approval)
AdminPromotionRouter.post(
  "/",
  [
    body("title", "Title is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 3 })
      .withMessage("Title must be at least 3 characters long"),
    body("description", "Description is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters long"),
    body("type", "Type is required")
      .exists({ checkFalsy: true, checkNull: true })
      .isIn(["discount", "offer", "announcement", "feature"]),
    body("targetAudience", "Target audience is required")
      .exists({ checkFalsy: true, checkNull: true })
      .isIn(["all", "premium", "basic", "organizations"]),
    body("startDate", "Start date is required")
      .exists({ checkFalsy: true, checkNull: true })
      .isISO8601()
      .withMessage("Please provide a valid start date"),
    body("endDate", "End date is required")
      .optional()
      .isISO8601()
      .withMessage("Please provide a valid end date"),
  ],
  Controller.CreatePromotion,
);

// Update an existing promotion
AdminPromotionRouter.put(
  "/:id",
  [
    param("id", "ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
    body("title", "Title is required")
      .optional()
      .trim()
      .isLength({ min: 3 })
      .withMessage("Title must be at least 3 characters long"),
    body("description", "Description is required")
      .optional()
      .trim()
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters long"),
    body("type", "Type is required")
      .optional()
      .isIn(["discount", "offer", "announcement", "feature"]),
    body("targetAudience", "Target audience is required")
      .optional()
      .isIn(["all", "premium", "basic", "organizations"]),
    body("startDate", "Start date is required")
      .optional()
      .isISO8601()
      .withMessage("Please provide a valid start date"),
    body("endDate", "End date is required")
      .optional()
      .isISO8601()
      .withMessage("Please provide a valid end date"),
    body("isActive", "isActive must be boolean").optional().isBoolean(),
  ],
  Controller.UpdatePromotion,
);

// Deactivate a promotion
AdminPromotionRouter.post(
  "/deactivate/:id",
  param("id", "ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.DeactivatePromotion,
);

// Activate a promotion
AdminPromotionRouter.post(
  "/activate/:id",
  param("id", "ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.ActivatePromotion,
);

// Delete a promotion that was created by admin (admin cannot delete user's promotion)
AdminPromotionRouter.delete(
  "/:id",
  param("id", "ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.DeleteAdminPromotion,
);

// Flag promotion
AdminPromotionRouter.post(
  "/flag/:id",
  [
    param("id", "ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
    body("flagReason", "Flag reason is required")
      .optional()
      .trim()
      .isLength({ min: 5 })
      .withMessage("Flag reason must be at least 5 characters long"),
  ],
  Controller.FlagPromotion,
);

// Unflag promotion
AdminPromotionRouter.post(
  "/unflag/:id",
  param("id", "ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.UnflagPromotion,
);

// Get all flagged promotions
AdminPromotionRouter.get(
  "/flagged",
  [
    query("page", "Page must be a number").optional().isNumeric(),
    query("limit", "Limit must be a number").optional().isNumeric(),
  ],
  Controller.GetAllFlaggedPromotions,
);

// Get promotion statistics (view, clicks, conversions, etc.)
AdminPromotionRouter.get("/statistics", Controller.GetPromotionStatistics);

// Get all promotions created by users
AdminPromotionRouter.get(
  "/user-promotions",
  [
    query("page", "Page must be a number").optional().isNumeric(),
    query("limit", "Limit must be a number").optional().isNumeric(),
  ],
  Controller.GetUsersPromotions,
);

// Get all promotions created by a specific user
AdminPromotionRouter.get(
  "/user-promotions/user/:id",
  [
    param("id", "User ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
    query("page", "Page must be a number").optional().isNumeric(),
    query("limit", "Limit must be a number").optional().isNumeric(),
  ],
  Controller.GetSingleUserPromotions,
);

// Get all promotion requests
AdminPromotionRouter.get(
  "/requests",
  [
    query("page", "Page must be a number").optional().isNumeric(),
    query("limit", "Limit must be a number").optional().isNumeric(),
  ],
  Controller.GetAllPromotionRequests,
);

// Approve promotion request
AdminPromotionRouter.post(
  "/requests/approve/:id",
  [
    param("id", "Request ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.ApprovePromotionRequest,
);

// Reject promotion request
AdminPromotionRouter.post(
  "/requests/reject/:id",
  [
    param("id", "Request ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
    body("rejectionReason", "Rejection reason is required")
      .optional()
      .trim()
      .isLength({ min: 5 })
      .withMessage("Rejection reason must be at least 5 characters long"),
  ],
  Controller.RejectPromotionRequest,
);

// Get single promotion request by ID
AdminPromotionRouter.get(
  "/requests/details/:id",
  param("id", "Request ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetPromotionRequestDetails,
);

export default AdminPromotionRouter;
