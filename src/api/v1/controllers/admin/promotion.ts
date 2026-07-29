import { Response } from "express";
import { validationResult } from "express-validator";
import { getAdminUserDetails } from "../../../../functions/auth";
import {
  sendCatchFeedback,
  sendErrorFeedback,
  sendSuccessFeedback,
  sendValidationErrorFeedback,
} from "../../../../functions/feedback";
import PromotionModel from "../../../../models/promotion.model";
import { CustomRequest } from "../../../../types/express";
import {
  IdParams,
  PaginationQuery,
  PromotionCreateRequestBody,
  PromotionFlagRequestBody,
  PromotionUpdateRequestBody,
} from "../../../../types/requests";
import { getPaginationOptions } from "../../../../utils/pagination";

export const AdminPromotionController = () => {
  const GetAllPromotions = async (
    req: CustomRequest<
      never,
      any,
      any,
      PaginationQuery & {
        type?: string;
        targetAudience?: string;
        isActive?: string;
        isFlagged?: string;
      }
    >,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { type, targetAudience, isActive, isFlagged } = req.query;

      // Build filter
      const filter: Record<string, any> = {};
      if (type) filter.type = type;
      if (targetAudience) filter.targetAudience = targetAudience;
      if (isActive !== undefined) filter.isActive = isActive === "true";
      if (isFlagged !== undefined) filter.isFlagged = isFlagged === "true";

      const paginationOptions = getPaginationOptions(req);

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

  const GetSinglePromotion = async (
    req: CustomRequest<IdParams>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const promotion = await PromotionModel.findById(id).populate([
        "createdByDetails",
        "updatedByDetails",
        "flaggedByDetails",
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
    req: CustomRequest<never, any, PromotionCreateRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { title, description, type, targetAudience, startDate, endDate } =
        req.body;
      const adminDetails = await getAdminUserDetails(req);

      // Validate dates
      if (endDate && new Date(startDate) >= new Date(endDate)) {
        return sendErrorFeedback(
          res,
          400,
          "Start date must be before end date",
        );
      }

      // Check for duplicate active promotion with same title
      const existingPromotion = await PromotionModel.findOne({
        title,
        isActive: true,
      });
      if (existingPromotion) {
        return sendErrorFeedback(
          res,
          409,
          "Active promotion with this title already exists",
        );
      }

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
    req: CustomRequest<IdParams, any, PromotionUpdateRequestBody>,
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

      const adminDetails = await getAdminUserDetails(req);

      const updatedBy = adminDetails?._id;

      const promotion = await PromotionModel.findById(id);
      if (!promotion) {
        return sendErrorFeedback(res, 404, "Promotion not found");
      }

      const updateData: Record<string, any> = {};
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

  const DeactivatePromotion = async (
    req: CustomRequest<IdParams>,
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

      await PromotionModel.findByIdAndUpdate(id, { isActive: false });

      return sendSuccessFeedback(res, "Promotion deactivated successfully");
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const ActivatePromotion = async (
    req: CustomRequest<IdParams>,
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
    req: CustomRequest<IdParams, any, PromotionFlagRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const adminDetails = await getAdminUserDetails(req);
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
    req: CustomRequest<IdParams, any, PromotionFlagRequestBody>,
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
    req: CustomRequest<never, any, any, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const paginationOptions = getPaginationOptions(req);

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
