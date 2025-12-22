import { Router } from "express";
import { param } from "express-validator";
import { isValidObjectId } from "../../../../middleware/validation";
import { UserMessagingController } from "../../controllers/user/messaging";

const UserMessagingRouter = Router();
const Controller = UserMessagingController();

// Get message history
UserMessagingRouter.get("/history", Controller.GetMessageHistory);

// Get list of users that can be messaged
UserMessagingRouter.get("/contacts", Controller.GetMessageableUsers);

// Send a message
UserMessagingRouter.post("/send", Controller.SendMessage);

// View user details for messaging
UserMessagingRouter.get(
  "/user/:id",
  param("id", "User ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetUserForMessaging,
);

// View conversation history with a specific user
UserMessagingRouter.get(
  "/conversation/:userId",
  param("userId", "User ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetConversationHistory,
);

// Search all messages with a specific keyword
UserMessagingRouter.get("/search", Controller.SearchMessages);

// Mark conversation with user as read
UserMessagingRouter.patch(
  "/conversation/:userId/read",
  param("userId", "User ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.MarkConversationAsRead,
);

// Mark all conversations as read
UserMessagingRouter.patch(
  "/conversations/read-all",
  Controller.MarkAllConversationsAsRead,
);

// Mark message as read
UserMessagingRouter.patch(
  "/message/:id/read",
  param("id", "Message ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.MarkMessageAsRead,
);

// Delete message
UserMessagingRouter.delete(
  "/message/:id",
  param("id", "Message ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.DeleteMessage,
);

// Update message
UserMessagingRouter.put(
  "/message/:id",
  param("id", "Message ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.UpdateMessage,
);

export default UserMessagingRouter;
