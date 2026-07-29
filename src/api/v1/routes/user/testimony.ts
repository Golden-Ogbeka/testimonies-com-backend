import { Router } from "express";
import { body, param, query } from "express-validator";
import { isUserOrOrganization } from "../../../../middleware/auth";
import { isValidObjectId } from "../../../../middleware/validation";
import { mediaParser } from "../../../../utils/cloudinary";
import { UserTestimonyController } from "../../controllers/user/testimony";

const UserTestimonyRouter = Router();
const Controller = UserTestimonyController();

// Get testimonies (unauthenticated) - Would not include replies and analytics details. Would just include the count
UserTestimonyRouter.get(
  "/public",
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
  Controller.GetPublicTestimonies,
);

// Get single testimony by id (unauthenticated) - Would not include replies and analytics details. Would just include the count
UserTestimonyRouter.get(
  "/public/:id",
  param("id", "Testimony ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetPublicTestimony,
);

// Get testimonies (authenticated) - Would include the details of analytics (replies, etc)
UserTestimonyRouter.get(
  "/",
  [
    isUserOrOrganization,
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    // Search queries
    query("tag")
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage("Tag must be between 1 and 50 characters"),
    query("keyword")
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Keyword must be between 1 and 100 characters"),
    query("type")
      .optional()
      .isIn(["broadcast", "normal"])
      .withMessage("Type must be either 'broadcast' or 'normal'"),
    query("userId")
      .optional()
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.GetTestimonies as any,
);

// Get single testimony by id (authenticated) - Would include the details of analytics (replies, etc)
UserTestimonyRouter.get(
  "/:id",
  isUserOrOrganization,
  param("id", "Testimony ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetTestimony as any,
);

// Create testimony
UserTestimonyRouter.post(
  "/",
  [
    isUserOrOrganization,
    mediaParser.array("testimonyMediaFiles", 4), // Maximum 4 files
    body("testimonyMediaFiles").custom((value, { req }) => {
      if (req.files && req.files.length > 4) {
        throw new Error("Maximum 4 files allowed");
      }
      return true;
    }),

    body("title", "Title is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage("Title must be between 3 and 200 characters"),
    body("description", "Description is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 10, max: 5000 })
      .withMessage("Description must be between 10 and 5000 characters"),
    body("tags")
      .optional({ checkFalsy: true })
      .custom((tags) => {
        if (typeof tags === "string") {
          tags = JSON.parse(tags);
        }
        if (tags && tags.length > 10) {
          throw new Error("Maximum 10 tags allowed");
        }
        if (
          tags &&
          tags.some(
            (tag: string) => typeof tag !== "string" || tag.trim().length === 0,
          )
        ) {
          throw new Error("Each tag must be a non-empty string");
        }
        if (tags && tags.some((tag: string) => tag.length > 50)) {
          throw new Error("Each tag must be maximum 50 characters");
        }

        // Make all tags lowercase
        tags?.forEach((tag: string, index: number) => {
          tags[index] = tag.toLowerCase();
        });

        // Remove duplicate tags
        tags = Array.from(new Set(tags));

        // Remove empty tags
        tags = tags.filter((tag: string) => tag.trim().length > 0);

        if (tags.length > 10) {
          throw new Error("Maximum 10 tags allowed");
        }

        return true;
      }),
    body("isBroadcast")
      .optional()
      .isBoolean()
      .withMessage("isBroadcast must be a boolean")
      .toBoolean()
      .custom((value, { req }) => {
        if (value === true && !req.body.broadcastOrganizationId) {
          throw new Error(
            "broadcastOrganizationId is required when isBroadcast is true",
          );
        }
        return true;
      }),
    body("broadcastOrganizationId")
      .optional({ checkFalsy: true })
      .custom((value) => isValidObjectId(value)),
    body("isSecret")
      .optional()
      .isBoolean()
      .withMessage("Kindly specify if testimony is secret or not as a boolean")
      .toBoolean(),
  ],
  Controller.CreateTestimony as any,
);

// Update testimony (for subscribed users only)
UserTestimonyRouter.put(
  "/:id",
  [
    isUserOrOrganization,
    param("id", "Testimony ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
    body("title", "Title is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage("Title must be between 3 and 200 characters"),
    body("description", "Description is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 10, max: 5000 })
      .withMessage("Description must be between 10 and 5000 characters"),
    body("tags")
      .optional({ checkFalsy: true })
      .isArray()
      .withMessage("Tags must be an array")
      .custom((tags) => {
        if (tags && tags.length > 10) {
          throw new Error("Maximum 10 tags allowed");
        }
        if (
          tags &&
          tags.some(
            (tag: string) => typeof tag !== "string" || tag.trim().length === 0,
          )
        ) {
          throw new Error("Each tag must be a non-empty string");
        }
        if (tags && tags.some((tag: string) => tag.length > 50)) {
          throw new Error("Each tag must be maximum 50 characters");
        }

        // Make all tags lowercase
        tags?.forEach((tag: string, index: number) => {
          tags[index] = tag.toLowerCase();
        });

        // Remove duplicate tags
        tags = Array.from(new Set(tags));

        // Remove empty tags
        tags = tags.filter((tag: string) => tag.trim().length > 0);

        if (tags.length > 10) {
          throw new Error("Maximum 10 tags allowed");
        }

        return true;
      }),
    body("isBroadcast")
      .optional()
      .isBoolean()
      .withMessage("isBroadcast must be a boolean")
      .toBoolean()
      .custom((value, { req }) => {
        if (value === true && !req.body.broadcastOrganizationId) {
          throw new Error(
            "broadcastOrganizationId is required when isBroadcast is true",
          );
        }
        return true;
      }),
    body("broadcastOrganizationId")
      .optional({ checkFalsy: true })
      .custom((value) => isValidObjectId(value)),
    body("isSecret")
      .optional()
      .isBoolean()
      .withMessage("Kindly specify if testimony is secret or not as a boolean")
      .toBoolean(),
  ],
  Controller.UpdateTestimony as any,
);

// Delete testimony (for subscribed users only)
UserTestimonyRouter.delete(
  "/:id",
  [
    isUserOrOrganization,
    param("id", "Testimony ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.DeleteTestimony as any,
);

// Reply to testimony
UserTestimonyRouter.post(
  "/:id/reply",
  [
    isUserOrOrganization,
    param("id", "Testimony ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
    body("content", "Reply content is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage("Reply content must be between 1 and 2000 characters"),
  ],
  Controller.ReplyToTestimony as any,
);

// Update reply to testimony (for subscribed users only)
UserTestimonyRouter.put(
  "/reply/:id",
  [
    isUserOrOrganization,
    param("id", "Reply ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
    body("description")
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage("Reply must be between 1 and 2000 characters"),
  ],
  Controller.UpdateReply as any,
);

// Delete reply to testimony (for subscribed users only)
UserTestimonyRouter.delete(
  "/reply/:id",
  [
    isUserOrOrganization,
    param("id", "Reply ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.DeleteReply as any,
);

// Like testimony
UserTestimonyRouter.post(
  "/:id/like",
  [
    isUserOrOrganization,
    param("id", "Testimony ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.LikeTestimony,
);

// Unlike testimony
UserTestimonyRouter.delete(
  "/:id/like",
  [
    isUserOrOrganization,
    param("id", "Testimony ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.UnlikeTestimony as any,
);

// Get testimony likes
UserTestimonyRouter.get(
  "/:id/likes",
  isUserOrOrganization,
  param("id", "Testimony ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetTestimonyLikes as any,
);

// Get whether user liked testimony
UserTestimonyRouter.get(
  "/:id/liked",
  [
    isUserOrOrganization,
    param("id", "Testimony ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.CheckTestimonyLiked as any,
);

// Get replies for a testimony
UserTestimonyRouter.get(
  "/:id/replies",
  [
    param("id", "Testimony ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
  Controller.GetTestimonyReplies as any,
);

// Get single reply by id
UserTestimonyRouter.get(
  "/reply/details/:id",
  param("id", "Reply ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetReply as any,
);

// Like reply to testimony
UserTestimonyRouter.post(
  "/reply/:id/like",
  [
    isUserOrOrganization,
    param("id", "Reply ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.LikeReply,
);

// Unlike reply to testimony
UserTestimonyRouter.delete(
  "/reply/:id/like",
  [
    isUserOrOrganization,
    param("id", "Reply ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.UnlikeReply,
);

// Get whether user liked a reply
UserTestimonyRouter.get(
  "/reply/:id/liked",
  [
    isUserOrOrganization,
    param("id", "Reply ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.CheckReplyLiked as any,
);

// Get likes for a reply
UserTestimonyRouter.get(
  "/reply/:id/likes",
  param("id", "Reply ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetReplyLikes as any,
);

// Get testimonies of a specific user by userId (authenticated)
UserTestimonyRouter.get(
  "/user/:userId",
  [
    isUserOrOrganization,
    param("userId", "User ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
  Controller.GetUserTestimonies as any,
);

// Get user's testimonies (for authenticated users only)
UserTestimonyRouter.get(
  "/user/my-testimonies",
  [
    isUserOrOrganization,
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
  Controller.GetMyTestimonies as any,
);

// Get user's replies to testimonies (for authenticated users only)
UserTestimonyRouter.get(
  "/user/my-replies",
  [
    isUserOrOrganization,
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
  Controller.GetMyReplies as any,
);

// Delete all testimonies for a user (for subscribed users only)
UserTestimonyRouter.post(
  "/user/delete-all-testimonies",
  [
    isUserOrOrganization,
    body("password", "Password is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number")
      .matches(/[!@#$%^&*]/)
      .withMessage(
        "Password must contain at least one special character (!@#$%^&*)",
      ),
  ],
  Controller.DeleteAllTestimonies,
);

// Delete all replies to testimonies for a user (for subscribed users only)
UserTestimonyRouter.post(
  "/user/delete-all-replies",
  [
    isUserOrOrganization,
    body("password", "Password is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number")
      .matches(/[!@#$%^&*]/)
      .withMessage(
        "Password must contain at least one special character (!@#$%^&*)",
      ),
  ],
  Controller.DeleteAllReplies,
);

// Get tags for testimonies
UserTestimonyRouter.get(
  "/tag/all",
  [
    isUserOrOrganization,
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 100"),
  ],
  Controller.GetTestimonyTags,
);

// Get trending testimonies
UserTestimonyRouter.get(
  "/filter/trending",
  [
    isUserOrOrganization,
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage("Limit must be between 1 and 20"),
  ],
  Controller.GetTrendingTestimonies as any,
);

// Get replies of a specific user by user id
UserTestimonyRouter.get(
  "/user-replies/:userId",
  [
    isUserOrOrganization,
    param("userId", "User ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
  Controller.GetUserReplies as any,
);

// Get user testimony statistics (number of testimonies, replies, likes received, views received)
UserTestimonyRouter.get(
  "/stats/user",
  isUserOrOrganization,
  Controller.GetUserTestimonyStats,
);

// View broadcast testimony requests
UserTestimonyRouter.get(
  "/broadcast/requests",
  [
    isUserOrOrganization,
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
  Controller.GetBroadcastRequests as any,
);

// View broadcast testimony request by id
UserTestimonyRouter.get(
  "/broadcast/requests/:id",
  [
    isUserOrOrganization,
    param("id", "Request ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.GetBroadcastRequest as any,
);

// Approve broadcast testimony request
UserTestimonyRouter.post(
  "/broadcast/requests/:id/approve",
  [
    isUserOrOrganization,
    param("id", "Request ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.ApproveBroadcastRequest as any,
);

// Reject broadcast testimony request
UserTestimonyRouter.post(
  "/broadcast/requests/:id/reject",
  [
    isUserOrOrganization,
    param("id", "Request ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.RejectBroadcastRequest as any,
);

export default UserTestimonyRouter;
