import { Request, Response } from "express";
import { sendCatchFeedback } from "../../../../functions/feedback";

export const AdminPromotionController = () => {
  const GetAllPromotions = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetSinglePromotion = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const CreatePromotion = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const UpdatePromotion = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const DeactivatePromotion = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const ActivatePromotion = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const DeleteAdminPromotion = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const FlagPromotion = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const UnflagPromotion = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetAllFlaggedPromotions = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetPromotionStatistics = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetUsersPromotions = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetSingleUserPromotions = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };
  const GetAllPromotionRequests = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const ApprovePromotionRequest = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const RejectPromotionRequest = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetPromotionRequestDetails = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };
  return {
    GetAllPromotions,
    GetSinglePromotion,
    CreatePromotion,
    UpdatePromotion,
    DeactivatePromotion,
    ActivatePromotion,
    DeleteAdminPromotion,
    FlagPromotion,
    UnflagPromotion,
    GetAllFlaggedPromotions,
    GetPromotionStatistics,
    GetUsersPromotions,
    GetSingleUserPromotions,
    GetAllPromotionRequests,
    ApprovePromotionRequest,
    RejectPromotionRequest,
    GetPromotionRequestDetails,
  };
};
