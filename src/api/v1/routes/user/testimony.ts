import { Router } from "express";
import { param } from "express-validator";
import { isValidObjectId } from "../../../../middleware/validation";
import { UserTestimonyController } from "../../controllers/user/testimony";

const UserTestimonyRouter = Router();
const Controller = UserTestimonyController();

// Get testimonies (unauthenticated) - Would not include replies and analytics details. Would just include the count
UserTestimonyRouter.get("/public", Controller.GetPublicTestimonies);

// Get single testimony by id (unauthenticated) - Would not include replies and analytics details. Would just include the count
UserTestimonyRouter.get(
  "/public/:id",
  param("id", "Testimony ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetPublicTestimony,
);

// Get testimonies (authenticated) - Would include the details of analytics (replies, etc)
UserTestimonyRouter.get("/", Controller.GetTestimonies);

// Get single testimony by id (authenticated) - Would include the details of analytics (replies, etc)
UserTestimonyRouter.get(
  "/:id",
  param("id", "Testimony ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetTestimony,
);

// Create testimony
UserTestimonyRouter.post("/", Controller.CreateTestimony);

// Update testimony (for subscribed users only)
UserTestimonyRouter.put(
  "/:id",
  param("id", "Testimony ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.UpdateTestimony,
);

// Delete testimony (for subscribed users only)
UserTestimonyRouter.delete(
  "/:id",
  param("id", "Testimony ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.DeleteTestimony,
);

// Reply to testimony
UserTestimonyRouter.post(
  "/:id/reply",
  param("id", "Testimony ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.ReplyToTestimony,
);

// Update reply to testimony (for subscribed users only)
UserTestimonyRouter.put(
  "/reply/:id",
  param("id", "Reply ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.UpdateReply,
);

// Delete reply to testimony (for subscribed users only)
UserTestimonyRouter.delete(
  "/reply/:id",
  param("id", "Reply ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.DeleteReply,
);

// Like testimony
UserTestimonyRouter.post(
  "/:id/like",
  param("id", "Testimony ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.LikeTestimony,
);

// Unlike testimony
UserTestimonyRouter.delete(
  "/:id/like",
  param("id", "Testimony ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.UnlikeTestimony,
);

// Get testimony likes count
UserTestimonyRouter.get(
  "/:id/likes/count",
  param("id", "Testimony ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetTestimonyLikesCount,
);

// Get whether user liked testimony
UserTestimonyRouter.get(
  "/:id/liked",
  param("id", "Testimony ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.CheckTestimonyLiked,
);

// Get replies for a testimony
UserTestimonyRouter.get(
  "/:id/replies",
  param("id", "Testimony ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetTestimonyReplies,
);

// Get single reply by id
UserTestimonyRouter.get(
  "/reply/details/:id",
  param("id", "Reply ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetReply,
);

// Get replies count for a testimony
UserTestimonyRouter.get(
  "/:id/replies/count",
  param("id", "Testimony ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetTestimonyRepliesCount,
);

// Like reply to testimony
UserTestimonyRouter.post(
  "/reply/:id/like",
  param("id", "Reply ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.LikeReply,
);

// Unlike reply to testimony
UserTestimonyRouter.delete(
  "/reply/:id/like",
  param("id", "Reply ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.UnlikeReply,
);

// Get whether user liked a reply
UserTestimonyRouter.get(
  "/reply/:id/liked",
  param("id", "Reply ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.CheckReplyLiked,
);

// Get likes count for a reply
UserTestimonyRouter.get(
  "/reply/:id/likes/count",
  param("id", "Reply ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetReplyLikesCount,
);

// Get testimony analytics (views, likes, replies) - for authenticated users only
UserTestimonyRouter.get(
  "/:id/analytics",
  param("id", "Testimony ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetTestimonyAnalytics,
);

// Record a view for a testimony
UserTestimonyRouter.post(
  "/:id/view",
  param("id", "Testimony ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.RecordView,
);

// Get user's testimonies (for authenticated users only)
UserTestimonyRouter.get("/user/my-testimonies", Controller.GetMyTestimonies);

// Get user's replies to testimonies (for authenticated users only)
UserTestimonyRouter.get("/user/my-replies", Controller.GetMyReplies);

// Delete all testimonies for a user (for subscribed users only)
UserTestimonyRouter.delete(
  "/user/all-testimonies",
  Controller.DeleteAllTestimonies,
);

// Delete all replies to testimonies for a user (for subscribed users only)
UserTestimonyRouter.delete("/user/all-replies", Controller.DeleteAllReplies);

// Get testimonies by tag (unauthenticated) - Would not include replies and analytics details. Would just include the count
UserTestimonyRouter.get(
  "/public/tag/:tag",
  Controller.GetPublicTestimoniesByTag,
);

// Get testimonies by tag (authenticated) - Would include the details of analytics (replies, etc)
UserTestimonyRouter.get("/tag/:tag", Controller.GetTestimoniesByTag);

// Get trending testimonies
UserTestimonyRouter.get("/filter/trending", Controller.GetTrendingTestimonies);

// Get latest testimonies
UserTestimonyRouter.get("/filter/latest", Controller.GetLatestTestimonies);

// Get testimonies by type (broadcast or normal)
UserTestimonyRouter.get("/filter/type/:type", Controller.GetTestimoniesByType);

// Get testimonies of a specific user by user id
UserTestimonyRouter.get(
  "/user/:userId/testimonies",
  param("userId", "User ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetUserTestimonies,
);

// Get replies of a specific user by user id
UserTestimonyRouter.get(
  "/user/:userId/replies",
  param("userId", "User ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetUserReplies,
);

// Search testimonies by keyword
UserTestimonyRouter.get(
  "/search/keyword",
  Controller.SearchTestimoniesByKeyword,
);

// Search testimonies by tag
UserTestimonyRouter.get("/search/tag", Controller.SearchTestimoniesByTag);

// Search testimonies by type (broadcast or normal)
UserTestimonyRouter.get("/search/type", Controller.SearchTestimoniesByType);

// Get user testimony statistics (number of testimonies, replies, likes received, views received)
UserTestimonyRouter.get("/stats/user", Controller.GetUserTestimonyStats);

// Get popular tags used in testimonies
UserTestimonyRouter.get("/stats/popular-tags", Controller.GetPopularTags);

// Get testimony length statistics (average, min, max lengths)
UserTestimonyRouter.get("/stats/length", Controller.GetTestimonyLengthStats);

// View broadcast testimony requests
UserTestimonyRouter.get("/broadcast-requests", Controller.GetBroadcastRequests);

// View broadcast testimony request by id
UserTestimonyRouter.get(
  "/broadcast-requests/:id",
  param("id", "Request ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetBroadcastRequest,
);

// Approve broadcast testimony request
UserTestimonyRouter.post(
  "/broadcast-requests/:id/approve",
  param("id", "Request ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.ApproveBroadcastRequest,
);

// Reject broadcast testimony request
UserTestimonyRouter.post(
  "/broadcast-requests/:id/reject",
  param("id", "Request ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.RejectBroadcastRequest,
);

export default UserTestimonyRouter;
