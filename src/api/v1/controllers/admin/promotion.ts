import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { getAdminUserDetails } from "../../../../functions/auth";
import {
  sendCatchFeedback,
  sendErrorFeedback,
  sendSuccessFeedback,
  sendValidationErrorFeedback,
} from "../../../../functions/feedback";
import PromotionModel from "../../../../models/promotion.model";
import {
  IdParams,
  PaginationQuery,
  PromotionCreateRequestBody,
  PromotionFlagRequestBody,
  PromotionUpdateRequestBody,
} from "../../../../types/requests";
import { getPaginationOptions } from "../../../../utils/pagination";

export const AdminPromotionController = () => {
  const GetAllPromotions = async (req: Request, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const {
        page = 1,
        limit = 20,
        type,
        targetAudience,
        isActive,
        isFlagged,
      } = req.query;

      // Build filter
      const filter: any = {};
      if (type) filter.type = type;
      if (targetAudience) filter.targetAudience = targetAudience;
      if (isActive !== undefined) filter.isActive = isActive === "true";
      if (isFlagged !== undefined) filter.isFlagged = isFlagged === "true";

      const paginationOptions = getPaginationOptions(req as any);

      const promotions = await PromotionModel.paginate(filter, {
        ...paginationOptions,
        sort: { createdAt: -1 },
      });

      return sendSuccessFeedback(res, "Promotions retrieved", {
        promotions,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetSinglePromotion = async (req: Request<IdParams>, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const promotion = await PromotionModel.findById(id).populate([
        "createdBy",
        "updatedBy",
        "flaggedBy",
      ]);

      if (!promotion) {
        return sendErrorFeedback(res, 404, "Promotion not found");
      }

      return sendSuccessFeedback(res, "Promotion retrieved", { promotion });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const CreatePromotion = async (
    req: Request<never, never, PromotionCreateRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { title, description, type, targetAudience, startDate, endDate } =
        req.body;
      const adminDetails = await getAdminUserDetails(req as any);

      const createdBy = adminDetails?._id;

      const promotion = await PromotionModel.create({
        title,
        description,
        type,
        targetAudience: targetAudience || "all",
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        createdBy,
      });

      return sendSuccessFeedback(res, "Promotion created successfully", {
        promotion,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const UpdatePromotion = async (
    req: Request<IdParams, never, PromotionUpdateRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;
      const {
        title,
        description,
        type,
        targetAudience,
        startDate,
        endDate,
        isActive,
      } = req.body;

      const adminDetails = await getAdminUserDetails(req as any);

      const updatedBy = adminDetails?._id;

      const promotion = await PromotionModel.findById(id);
      if (!promotion) {
        return sendErrorFeedback(res, 404, "Promotion not found");
      }

      const updateData: any = {};
      if (title) updateData.title = title;
      if (description) updateData.description = description;
      if (type) updateData.type = type;
      if (targetAudience) updateData.targetAudience = targetAudience;
      if (startDate) updateData.startDate = new Date(startDate);
      if (endDate !== undefined)
        updateData.endDate = endDate ? new Date(endDate) : undefined;
      if (isActive !== undefined) updateData.isActive = isActive;
      updateData.updatedBy = updatedBy;

      const updatedPromotion = await PromotionModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true },
      );
      return sendSuccessFeedback(res, "Promotion updated successfully", {
        promotion: updatedPromotion,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const DeactivatePromotion = async (req: Request<IdParams>, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const promotion = await PromotionModel.findById(id);
      if (!promotion) {
        return sendErrorFeedback(res, 404, "Promotion not found");
      }

      await PromotionModel.findByIdAndUpdate(id, { isActive: false });

      return sendSuccessFeedback(res, "Promotion deactivated successfully");
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const ActivatePromotion = async (req: Request<IdParams>, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const promotion = await PromotionModel.findById(id);
      if (!promotion) {
        return sendErrorFeedback(res, 404, "Promotion not found");
      }

      await PromotionModel.findByIdAndUpdate(id, { isActive: true });

      return sendSuccessFeedback(res, "Promotion activated successfully");
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const FlagPromotion = async (
    req: Request<IdParams, never, PromotionFlagRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const adminDetails = await getAdminUserDetails(req as any);
      const { id } = req.params;
      const { reason } = req.body;

      const promotion = await PromotionModel.findById(id);
      if (!promotion) {
        return sendErrorFeedback(res, 404, "Promotion not found");
      }

      const updatedPromotion = await PromotionModel.findByIdAndUpdate(
        id,
        {
          isFlagged: true,
          flaggedBy: adminDetails?._id,
          flagReason: reason || "Flagged by admin",
        },
        { new: true },
      );

      return sendSuccessFeedback(res, "Promotion flagged successfully", {
        promotion: updatedPromotion,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const UnflagPromotion = async (
    req: Request<IdParams, never, PromotionFlagRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const promotion = await PromotionModel.findById(id);
      if (!promotion) {
        return sendErrorFeedback(res, 404, "Promotion not found");
      }

      const updatedPromotion = await PromotionModel.findByIdAndUpdate(
        id,
        {
          isFlagged: false,
          flagReason: undefined,
          flaggedBy: undefined,
        },
        { new: true },
      );

      return sendSuccessFeedback(res, "Promotion unflagged successfully", {
        promotion: updatedPromotion,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetAllFlaggedPromotions = async (
    req: Request<never, never, never, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const paginationOptions = getPaginationOptions(req as any);

      const promotions = await PromotionModel.paginate(
        { isFlagged: true },
        {
          ...paginationOptions,
          sort: { createdAt: -1 },
        },
      );

      return sendSuccessFeedback(res, "Flagged promotions retrieved", {
        promotions,
      });
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
    FlagPromotion,
    UnflagPromotion,
    GetAllFlaggedPromotions,
  };
};
