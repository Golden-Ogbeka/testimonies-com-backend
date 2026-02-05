import { Request, Response } from "express";
import { sendCatchFeedback } from "../../../../functions/feedback";

export const UserPromotionController = () => {
  const GetAllPromotions = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const GetPromotion = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const CreatePromotion = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const UpdatePromotion = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const DeactivatePromotion = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const ActivatePromotion = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const DeletePromotion = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const GetPromotionRequests = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const DeletePromotionRequest = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const GetPromotionStats = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const GetPromotionForAd = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  return {
    GetAllPromotions,
    GetPromotion,
    CreatePromotion,
    UpdatePromotion,
    DeactivatePromotion,
    ActivatePromotion,
    DeletePromotion,
    GetPromotionRequests,
    DeletePromotionRequest,
    GetPromotionStats,
    GetPromotionForAd,
  };
};
