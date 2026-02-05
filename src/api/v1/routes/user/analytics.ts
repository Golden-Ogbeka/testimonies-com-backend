import { Router } from "express";
import { param, query } from "express-validator";
import { isValidObjectId } from "../../../../middleware/validation";
import { UserAnalyticsController } from "../../controllers/user/analytics";

const UserAnalyticsRouter = Router();
const Controller = UserAnalyticsController();

// Get testimony activity over time (number of testimonies created per day/week/month)
UserAnalyticsRouter.get("/testimony-activity", Controller.GetTestimonyActivity);

// Get reply activity over time (number of replies created per day/week/month)
UserAnalyticsRouter.get("/reply-activity", Controller.GetReplyActivity);

// Get like activity over time (number of likes given per day/week/month)
UserAnalyticsRouter.get("/like-activity", Controller.GetLikeActivity);

// Get view activity over time (number of views recorded per day/week/month)
UserAnalyticsRouter.get("/view-activity", Controller.GetViewActivity);

// Get user engagement statistics (average likes, replies, views per testimony)
UserAnalyticsRouter.get("/engagement", Controller.GetEngagementStats);

// Get team analytics summary (total testimonies, replies, likes, views)
UserAnalyticsRouter.get("/team/summary", Controller.GetTeamAnalyticsSummary);

// Get top testimonies by views
UserAnalyticsRouter.get(
  "/top-testimonies/views",
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
  Controller.GetTopTestimoniesByViews,
);

// Get top testimonies by likes
UserAnalyticsRouter.get(
  "/top-testimonies/likes",
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
  Controller.GetTopTestimoniesByLikes,
);

// Get top testimonies by replies
UserAnalyticsRouter.get(
  "/top-testimonies/replies",
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
  Controller.GetTopTestimoniesByReplies,
);

// Get team analytics of single team member
UserAnalyticsRouter.get(
  "/team/member/:id",
  param("id", "Team member ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetTeamMemberAnalytics,
);

export default UserAnalyticsRouter;
