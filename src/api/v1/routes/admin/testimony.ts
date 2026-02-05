import { Router } from "express";
import { param, query } from "express-validator";
import { isValidObjectId } from "../../../../middleware/validation";
import { AdminTestimonyController } from "../../controllers/admin/testimony";

const AdminTestimonyRouter = Router();
const Controller = AdminTestimonyController();

// Get testimonies with highest engagement (likes + replies + views)
AdminTestimonyRouter.get(
  "/highest-engagement",
  [
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
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
  Controller.GetTestimonyWithHighestLikes,
);

// Get testimonies with highest replies
AdminTestimonyRouter.get(
  "/highest-replies",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
  Controller.GetTestimonyWithHighestReplies,
);

// Get testimonies with highest views
AdminTestimonyRouter.get(
  "/highest-views",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
  Controller.GetTestimonyWithHighestViews,
);

// Get most active users (users with most testimonies created)
AdminTestimonyRouter.get(
  "/most-active-users",
  [
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
  param("id", "Testimony ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.FlagTestimony,
);

// Unflag testimony
AdminTestimonyRouter.post(
  "/unflag/:id",
  param("id", "Testimony ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.UnflagTestimony,
);

// Get all flagged testimonies
AdminTestimonyRouter.get(
  "/flagged",
  [
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
  param("id", "Testimony ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetTestimonyDetails,
);

// Get all testimonies
AdminTestimonyRouter.get(
  "/",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
  Controller.GetAllTestimonies,
);

export default AdminTestimonyRouter;
