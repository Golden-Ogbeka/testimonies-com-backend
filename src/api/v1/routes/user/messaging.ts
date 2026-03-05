import { Router } from "express";
import { param, query } from "express-validator";
import { isValidObjectId } from "../../../../middleware/validation";
import { UserMessagingController } from "../../controllers/user/messaging";

const UserMessagingRouter = Router();
const Controller = UserMessagingController();

// Get message history
UserMessagingRouter.get(
  "/history",
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
  Controller.GetMessageHistory as any,
);

// Get list of users that can be messaged
UserMessagingRouter.get(
  "/contacts",
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
  Controller.GetMessageableUsers as any,
);

// Send a message
UserMessagingRouter.post("/send", Controller.SendMessage as any);

// View user details for messaging
UserMessagingRouter.get(
  "/user/:id",
  param("id", "User ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetUserForMessaging as any,
);

// View conversation history with a specific user
UserMessagingRouter.get(
  "/conversation/:userId",
  [
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
  Controller.GetConversationHistory as any,
);

// Search all messages with a specific keyword
UserMessagingRouter.get(
  "/search",
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
  Controller.SearchMessages as any,
);

// Mark conversation with user as read
UserMessagingRouter.patch(
  "/conversation/:userId/read",
  param("userId", "User ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.MarkConversationAsRead as any,
);

// Mark all conversations as read
UserMessagingRouter.patch(
  "/conversations/read-all",
  Controller.MarkAllConversationsAsRead as any,
);

// Mark message as read
UserMessagingRouter.patch(
  "/message/:id/read",
  param("id", "Message ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.MarkMessageAsRead as any,
);

// Delete message
UserMessagingRouter.delete(
  "/message/:id",
  param("id", "Message ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.DeleteMessage as any,
);

// Update message
UserMessagingRouter.put(
  "/message/:id",
  param("id", "Message ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.UpdateMessage as any,
);

export default UserMessagingRouter;
