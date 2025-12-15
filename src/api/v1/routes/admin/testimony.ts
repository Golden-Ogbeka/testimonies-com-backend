import { Router } from "express";
import { param } from "express-validator";
import { isValidObjectId } from "../../../../middleware/validation";
import { AdminTestimonyController } from "../../controllers/admin/testimony";

const AdminTestimonyRouter = Router();
const Controller = AdminTestimonyController();

// Get testimonies with highest engagement (likes + replies + views)
AdminTestimonyRouter.get(
  "/highest-engagement",
  Controller.GetTestimonyWithHighestEngagement,
);

// Get testimonies with highest likes
AdminTestimonyRouter.get(
  "/highest-likes",
  Controller.GetTestimonyWithHighestLikes,
);

// Get testimonies with highest replies
AdminTestimonyRouter.get(
  "/highest-replies",
  Controller.GetTestimonyWithHighestReplies,
);

// Get testimonies with highest views
AdminTestimonyRouter.get(
  "/highest-views",
  Controller.GetTestimonyWithHighestViews,
);

// Get most active users (users with most testimonies created)
AdminTestimonyRouter.get("/most-active-users", Controller.GetMostActiveUsers);

// Get most engaged users (users with most replies made)
AdminTestimonyRouter.get("/most-engaged-users", Controller.GetMostEngagedUsers);

// Get most liked users (users whose testimonies received the most likes)
AdminTestimonyRouter.get("/most-liked-users", Controller.GetMostLikedUsers);

// Get most viewed users (users whose testimonies received the most views)
AdminTestimonyRouter.get("/most-viewed-users", Controller.GetMostViewedUsers);

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
AdminTestimonyRouter.get("/flagged", Controller.GetFlaggedTestimonies);

// View single testimony by id
AdminTestimonyRouter.get(
  "/details/:id",
  param("id", "Testimony ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetTestimonyDetails,
);

// Get all testimonies
AdminTestimonyRouter.get("/", Controller.GetAllTestimonies);

export default AdminTestimonyRouter;
