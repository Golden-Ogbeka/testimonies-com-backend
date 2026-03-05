import { Response } from "express";
import {
  sendCatchFeedback,
  sendErrorFeedback,
  sendSuccessFeedback,
} from "../../../../functions/feedback";
import ConversationModel from "../../../../models/conversation.model";
import MessageModel from "../../../../models/message.model";
import OrganizationModel from "../../../../models/organization.model";
import UserModel from "../../../../models/user.model";
import {
  AuthUserRequest,
  SendMessageRequestBody,
  UpdateMessageRequestBody,
} from "../../../../types";
import { getPaginationOptions } from "../../../../utils/pagination";

export const UserMessagingController = () => {
  const getUserIdAndType = (req: AuthUserRequest) => {
    const user = req.user;
    const isOrg = user.accountType === "organization";
    return {
      userId: user._id as string,
      userType: (isOrg ? "organization" : "user") as "user" | "organization",
      user,
    };
  };

  const GetConversationHistory = async (
    req: AuthUserRequest<never, any, any, { page?: string; limit?: string }>,
    res: Response,
  ) => {
    try {
      const { userId } = getUserIdAndType(req);

      const options = getPaginationOptions(req, { lastMessageAt: -1 }, [
        { path: "lastMessage" },
      ]);

      const conversations = await ConversationModel.paginate(
        { "participants.userId": userId },
        options,
      );

      // Populate participants details manually since it's an array of mixed ref types
      for (const conv of conversations.docs) {
        for (const p of conv.participants) {
          if (p.userType === "user") {
            // Basic population to mimic refPath
            const u = await UserModel.findById(p.userId).select(
              "firstName lastName email profileImage",
            );
            (p as any).details = u;
          } else {
            const o = await OrganizationModel.findById(p.userId).select(
              "businessName email businessLogoURL profileImage",
            );
            (p as any).details = o;
          }
        }
      }

      return sendSuccessFeedback(res, "Conversations retrieved successfully", {
        conversations,
      });
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetMessageHistory = async (
    req: AuthUserRequest<
      { conversationId: string },
      any,
      any,
      { page?: string; limit?: string }
    >,
    res: Response,
  ) => {
    try {
      const { userId } = getUserIdAndType(req);
      const { conversationId } = req.params;

      // Verify user is part of the conversation
      const conversation = await ConversationModel.findOne({
        _id: conversationId,
        "participants.userId": userId,
      });

      if (!conversation)
        return sendErrorFeedback(
          res,
          404,
          "Conversation not found or unauthorized",
        );

      const options = getPaginationOptions(req, { createdAt: -1 }, [
        { path: "senderDetails" },
      ]);

      const messages = await MessageModel.paginate(
        { conversationId, isDeleted: false },
        options,
      );

      return sendSuccessFeedback(res, "Message history retrieved", {
        messages,
      });
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetMessageableUsers = async (
    req: AuthUserRequest<
      never,
      any,
      any,
      { q?: string; page?: string; limit?: string }
    >,
    res: Response,
  ) => {
    try {
      const { userId } = getUserIdAndType(req);
      const { q = "" } = req.query;

      const options = getPaginationOptions(req, { createdAt: -1 });

      const query: any = { _id: { $ne: userId } };

      if (q) {
        query.$text = { $search: q };
      }

      const users = await UserModel.paginate(query, {
        ...options,
        select: "firstName lastName email profileImage accountType",
      });

      return sendSuccessFeedback(res, "Messageable users retrieved", {
        users,
      });
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const SendMessage = async (
    req: AuthUserRequest<never, any, SendMessageRequestBody>,
    res: Response,
  ) => {
    try {
      const { userId, userType } = getUserIdAndType(req);
      const { recipientId, recipientType, content } = req.body;

      if (!recipientId || !recipientType || !content) {
        return sendErrorFeedback(
          res,
          400,
          "Recipient and content are required",
        );
      }

      // Check if conversation exists
      let conversation = await ConversationModel.findOne({
        participants: {
          $all: [
            { $elemMatch: { userId, userType } },
            {
              $elemMatch: {
                userId: recipientId,
                userType: recipientType,
              },
            },
          ],
        },
      });

      if (!conversation) {
        conversation = await ConversationModel.create({
          participants: [
            { userId, userType },
            { userId: recipientId, userType: recipientType },
          ],
          unreadCount: new Map([[recipientId, 0]]),
        });
      }

      const message = await MessageModel.create({
        conversationId: conversation._id,
        senderId: userId,
        senderType: userType,
        content,
      });

      // Update conversation last message and unread count
      const unreadCount = conversation.unreadCount.get(recipientId) || 0;
      conversation.unreadCount.set(recipientId.toString(), unreadCount + 1);

      await ConversationModel.findByIdAndUpdate(conversation._id, {
        lastMessage: message._id,
        lastMessageAt: new Date(),
        unreadCount: conversation.unreadCount,
      });

      // In a real app, Socket.emit() would be called here to notify the recipient

      return sendSuccessFeedback(res, "Message sent", { message }, 201);
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetUserForMessaging = async (
    req: AuthUserRequest<{ id: string }>,
    res: Response,
  ) => {
    try {
      const user = await UserModel.findById(req.params.id).select(
        "firstName lastName email profileImage bio lastSuccessfulLogin",
      );

      if (!user) return sendErrorFeedback(res, 404, "User not found");

      return sendSuccessFeedback(res, "User profile retrieved", {
        user,
      });
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const SearchMessages = async (
    req: AuthUserRequest<
      never,
      any,
      any,
      { q?: string; page?: string; limit?: string }
    >,
    res: Response,
  ) => {
    try {
      const { userId } = getUserIdAndType(req);
      const { q } = req.query;

      if (!q) return sendErrorFeedback(res, 400, "Search query is required");

      const conversations = await ConversationModel.find({
        "participants.userId": userId,
      }).select("_id");
      const conversationIds = conversations.map((c) => c._id);

      const options = getPaginationOptions(req, { createdAt: -1 }, [
        { path: "senderDetails" },
      ]);

      const messages = await MessageModel.paginate(
        {
          conversationId: { $in: conversationIds },
          isDeleted: false,
          content: { $regex: q, $options: "i" },
        },
        options,
      );

      return sendSuccessFeedback(res, "Messages search results", {
        messages,
      });
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const MarkConversationAsRead = async (
    req: AuthUserRequest<{ conversationId: string }>,
    res: Response,
  ) => {
    try {
      const { userId } = getUserIdAndType(req);
      const { conversationId } = req.params;

      const conversation = await ConversationModel.findOne({
        _id: conversationId,
        "participants.userId": userId,
      });

      if (!conversation)
        return sendErrorFeedback(res, 404, "Conversation not found");

      // Mark all unread messages in this conversation not sent by me as read
      await MessageModel.updateMany(
        { conversationId, senderId: { $ne: userId }, isRead: false },
        { isRead: true, readAt: new Date() },
      );

      // Reset unread count for this user
      conversation.unreadCount.set(userId.toString(), 0);
      await conversation.save();

      return sendSuccessFeedback(res, "Conversation marked as read");
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const MarkAllConversationsAsRead = async (
    req: AuthUserRequest,
    res: Response,
  ) => {
    try {
      const { userId } = getUserIdAndType(req);

      const conversations = await ConversationModel.find({
        "participants.userId": userId,
      });
      const conversationIds = conversations.map((c) => c._id);

      await MessageModel.updateMany(
        {
          conversationId: { $in: conversationIds },
          senderId: { $ne: userId },
          isRead: false,
        },
        { isRead: true, readAt: new Date() },
      );

      // Reset all unread counts for this user
      for (const conv of conversations) {
        conv.unreadCount.set(userId.toString(), 0);
        await conv.save();
      }

      return sendSuccessFeedback(res, "All conversations marked as read");
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const MarkMessageAsRead = async (
    req: AuthUserRequest<{ messageId: string }>,
    res: Response,
  ) => {
    try {
      const { userId } = getUserIdAndType(req);
      const { messageId } = req.params;

      const message = await MessageModel.findOneAndUpdate(
        { _id: messageId, senderId: { $ne: userId } },
        { isRead: true, readAt: new Date() },
        { new: true },
      );

      if (!message)
        return sendErrorFeedback(res, 404, "Message not found or already read");

      return sendSuccessFeedback(res, "Message marked as read", {
        message,
      });
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const DeleteMessage = async (
    req: AuthUserRequest<{ messageId: string }>,
    res: Response,
  ) => {
    try {
      const { userId } = getUserIdAndType(req);
      const { messageId } = req.params;

      // Soft delete the message, assuming only sender can delete
      const message = await MessageModel.findOneAndUpdate(
        { _id: messageId, senderId: userId },
        { isDeleted: true },
        { new: true },
      );

      if (!message)
        return sendErrorFeedback(
          res,
          404,
          "Message not found or unauthorized to delete",
        );

      return sendSuccessFeedback(res, "Message deleted successfully");
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const UpdateMessage = async (
    req: AuthUserRequest<{ messageId: string }, any, UpdateMessageRequestBody>,
    res: Response,
  ) => {
    try {
      const { userId } = getUserIdAndType(req);
      const { messageId } = req.params;
      const { content } = req.body;

      if (!content)
        return sendErrorFeedback(res, 400, "Content cannot be empty");

      const message = await MessageModel.findOneAndUpdate(
        { _id: messageId, senderId: userId, isDeleted: false },
        { content },
        { new: true },
      );

      if (!message)
        return sendErrorFeedback(
          res,
          404,
          "Message not found or unauthorized to edit",
        );

      return sendSuccessFeedback(res, "Message updated successfully", {
        message,
      });
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  return {
    GetMessageHistory,
    GetMessageableUsers,
    SendMessage,
    GetUserForMessaging,
    GetConversationHistory,
    SearchMessages,
    MarkConversationAsRead,
    MarkAllConversationsAsRead,
    MarkMessageAsRead,
    DeleteMessage,
    UpdateMessage,
  };
};
