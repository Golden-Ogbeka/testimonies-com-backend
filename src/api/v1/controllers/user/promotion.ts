import { Request, Response } from "express";
import { sendCatchFeedback } from "../../../../functions/feedback";

export const UserPromotionController = () => {
  const GetAllPromotions = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetPromotion = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const CreatePromotion = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const UpdatePromotion = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const DeactivatePromotion = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const ActivatePromotion = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const DeletePromotion = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetPromotionRequests = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const DeletePromotionRequest = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetPromotionStats = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetPromotionForAd = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
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
