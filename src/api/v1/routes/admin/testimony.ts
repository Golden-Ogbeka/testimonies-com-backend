import { Router } from "express";
import { body, param, query } from "express-validator";
import { isAdmin } from "../../../../middleware/auth";
import { isValidObjectId } from "../../../../middleware/validation";
import { AdminTestimonyController } from "../../controllers/admin/testimony";

const AdminTestimonyRouter = Router();
const Controller = AdminTestimonyController();

// Get testimonies with highest engagement (likes + replies + views)
AdminTestimonyRouter.get(
  "/highest-engagement",
  [
    isAdmin,
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
  Controller.GetTestimonyWithHighestEngagement,
);

// Get testimonies with highest likes
AdminTestimonyRouter.get(
  "/highest-likes",
  [
    isAdmin,
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
  Controller.GetTestimoniesWithHighestLikes,
);

// Get testimonies with highest replies
AdminTestimonyRouter.get(
  "/highest-replies",
  [
    isAdmin,
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
  Controller.GetTestimoniesWithHighestReplies,
);

// Get testimonies with highest views
AdminTestimonyRouter.get(
  "/highest-views",
  [
    isAdmin,
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
  Controller.GetTestimoniesWithHighestViews,
);

// Get most active users (users with most testimonies created)
AdminTestimonyRouter.get(
  "/most-active-users",
  [
    isAdmin,
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
  Controller.GetMostActiveUsers,
);

// Get most engaged users (users with most replies made)
AdminTestimonyRouter.get(
  "/most-engaged-users",
  [
    isAdmin,
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
  Controller.GetMostEngagedUsers,
);

// Get most liked users (users whose testimonies received the most likes)
AdminTestimonyRouter.get(
  "/most-liked-users",
  [
    isAdmin,
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
  Controller.GetMostLikedUsers,
);

// Get most viewed users (users whose testimonies received the most views)
AdminTestimonyRouter.get(
  "/most-viewed-users",
  [
    isAdmin,
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
  Controller.GetMostViewedUsers,
);

// Flag testimony
AdminTestimonyRouter.post(
  "/flag/:id",
  [
    isAdmin,
    param("id", "Testimony ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
    body("reason", "Flag reason is required")
      .optional()
      .trim()
      .isLength({ min: 5 })
      .withMessage("Flag reason must be at least 5 characters long"),
  ],
  Controller.FlagTestimony as any,
);

// Unflag testimony
AdminTestimonyRouter.post(
  "/unflag/:id",
  [
    isAdmin,
    param("id", "Testimony ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.UnflagTestimony as any,
);

// Get all flagged testimonies
AdminTestimonyRouter.get(
  "/flagged",
  [
    isAdmin,
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
  Controller.GetFlaggedTestimonies,
);

// View single testimony by id
AdminTestimonyRouter.get(
  "/details/:id",
  [
    isAdmin,
    param("id", "Testimony ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.GetTestimonyDetails as any,
);

// Get all testimonies
AdminTestimonyRouter.get(
  "/",
  [
    isAdmin,
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("isFlagged", "isFlagged must be boolean")
      .optional()
      .isBoolean()
      .toBoolean(),
    query("userId", "User ID is required")
      .optional()
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.GetAllTestimonies,
);

export default AdminTestimonyRouter;
