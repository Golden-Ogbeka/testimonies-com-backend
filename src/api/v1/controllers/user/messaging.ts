import { Request, Response } from "express";
import {
  sendCatchFeedback,
  sendErrorFeedback,
} from "../../../../functions/feedback";

export const UserMessagingController = () => {
  const GetMessageHistory = async (req: Request, res: Response) => {
    try {
      return sendErrorFeedback(
        res,
        501,
        "GetMessageHistory endpoint is not yet implemented",
      );
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetMessageableUsers = async (req: Request, res: Response) => {
    try {
      return sendErrorFeedback(
        res,
        501,
        "GetMessageableUsers endpoint is not yet implemented",
      );
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const SendMessage = async (req: Request, res: Response) => {
    try {
      return sendErrorFeedback(
        res,
        501,
        "SendMessage endpoint is not yet implemented",
      );
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetUserForMessaging = async (req: Request, res: Response) => {
    try {
      return sendErrorFeedback(
        res,
        501,
        "GetUserForMessaging endpoint is not yet implemented",
      );
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetConversationHistory = async (req: Request, res: Response) => {
    try {
      return sendErrorFeedback(
        res,
        501,
        "GetConversationHistory endpoint is not yet implemented",
      );
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const SearchMessages = async (req: Request, res: Response) => {
    try {
      return sendErrorFeedback(
        res,
        501,
        "SearchMessages endpoint is not yet implemented",
      );
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const MarkConversationAsRead = async (req: Request, res: Response) => {
    try {
      return sendErrorFeedback(
        res,
        501,
        "MarkConversationAsRead endpoint is not yet implemented",
      );
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const MarkAllConversationsAsRead = async (req: Request, res: Response) => {
    try {
      return sendErrorFeedback(
        res,
        501,
        "MarkAllConversationsAsRead endpoint is not yet implemented",
      );
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const MarkMessageAsRead = async (req: Request, res: Response) => {
    try {
      return sendErrorFeedback(
        res,
        501,
        "MarkMessageAsRead endpoint is not yet implemented",
      );
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const DeleteMessage = async (req: Request, res: Response) => {
    try {
      return sendErrorFeedback(
        res,
        501,
        "DeleteMessage endpoint is not yet implemented",
      );
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const UpdateMessage = async (req: Request, res: Response) => {
    try {
      return sendErrorFeedback(
        res,
        501,
        "UpdateMessage endpoint is not yet implemented",
      );
    } catch (error) {
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
