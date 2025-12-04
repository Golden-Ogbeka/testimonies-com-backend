import { Router } from "express";
import { UserMessagingController } from "../../controllers/user/messaging";

const UserMessagingRouter = Router();
const Controller = UserMessagingController();

// Get message history

// Get list of users that can be messaged

// Send a message

// View user details for messaging

// View conversation history with a specific user

// Search all messages with a specific keyword

// Mark conversation with user as read

// Mark all conversations as read

// Mark message as read

// Delete message

// Update message

export default UserMessagingRouter;
