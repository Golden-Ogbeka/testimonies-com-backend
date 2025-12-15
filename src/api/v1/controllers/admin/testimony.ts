import { Request, Response } from "express";
import { sendCatchFeedback } from "../../../../functions/feedback";

export const AdminTestimonyController = () => {
  const GetTestimonyDetails = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetTestimonyWithHighestEngagement = async (
    req: Request,
    res: Response,
  ) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetTestimonyWithHighestLikes = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetTestimonyWithHighestReplies = async (
    req: Request,
    res: Response,
  ) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetTestimonyWithHighestViews = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetMostActiveUsers = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetMostEngagedUsers = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetMostLikedUsers = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetMostViewedUsers = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const FlagTestimony = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const UnflagTestimony = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetFlaggedTestimonies = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetAllTestimonies = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };
  return {
    GetTestimonyDetails,
    GetTestimonyWithHighestEngagement,
    GetTestimonyWithHighestLikes,
    GetTestimonyWithHighestReplies,
    GetTestimonyWithHighestViews,
    GetMostActiveUsers,
    GetMostEngagedUsers,
    GetMostLikedUsers,
    GetMostViewedUsers,
    FlagTestimony,
    UnflagTestimony,
    GetFlaggedTestimonies,
    GetAllTestimonies,
  };
};
