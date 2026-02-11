import { Router } from "express";
import { body, param, query } from "express-validator";
import { isAdmin, isSuperAdmin } from "../../../../middleware/auth";
import { isValidObjectId } from "../../../../middleware/validation";
import { AdminPromotionController } from "../../controllers/admin/promotion";

const AdminPromotionRouter = Router();
const Controller = AdminPromotionController();

// Get all promotions (filter by active/inactive)
AdminPromotionRouter.get(
  "/",
  [
    isAdmin,
    query("page", "Page must be a number").optional().isNumeric(),
    query("limit", "Limit must be a number").optional().isNumeric(),
    query("type", "Type is required")
      .optional()
      .isIn(["discount", "offer", "announcement", "feature"]),
    query("targetAudience", "Target audience is required")
      .optional()
      .isIn(["all", "premium", "basic", "organizations"]),
    query("isActive", "isActive must be boolean")
      .optional()
      .isBoolean()
      .toBoolean(),
    query("isFlagged", "isFlagged must be boolean")
      .optional()
      .isBoolean()
      .toBoolean(),
  ],
  Controller.GetAllPromotions,
);

// Get a single promotion by ID
AdminPromotionRouter.get(
  "/details/:id",
  [
    isAdmin,
    param("id", "ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.GetSinglePromotion as any,
);

// Create a new promotion (this creates a promotion request for another admin's approval)
AdminPromotionRouter.post(
  "/",
  [
    isAdmin,
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
    isAdmin,
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
    body("isActive", "isActive must be boolean")
      .optional()
      .isBoolean()
      .toBoolean(),
  ],
  Controller.UpdatePromotion as any,
);

// Deactivate a promotion
AdminPromotionRouter.post(
  "/deactivate/:id",
  [
    isSuperAdmin,
    param("id", "ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.DeactivatePromotion as any,
);

// Activate a promotion
AdminPromotionRouter.post(
  "/activate/:id",
  [
    isSuperAdmin,
    param("id", "ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.ActivatePromotion as any,
);

// Flag promotion
AdminPromotionRouter.post(
  "/flag/:id",
  [
    isAdmin,
    param("id", "ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
    body("reason", "Flag reason is required")
      .optional()
      .trim()
      .isLength({ min: 5 })
      .withMessage("Flag reason must be at least 5 characters long"),
  ],
  Controller.FlagPromotion as any,
);

// Unflag promotion
AdminPromotionRouter.post(
  "/unflag/:id",
  [
    isSuperAdmin,
    param("id", "ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.UnflagPromotion as any,
);

// Get all flagged promotions
AdminPromotionRouter.get(
  "/flagged",
  [
    isAdmin,
    query("page", "Page must be a number").optional().isNumeric(),
    query("limit", "Limit must be a number").optional().isNumeric(),
  ],
  Controller.GetAllFlaggedPromotions,
);

export default AdminPromotionRouter;
