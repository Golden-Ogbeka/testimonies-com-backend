import { Request, Response } from "express";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import {
  sendCatchFeedback,
  sendErrorFeedback,
  sendSuccessFeedback,
  sendValidationErrorFeedback,
} from "../../../../functions/feedback";
import { JWT_SECRET } from "../../../../functions/env";
import PromotionModel from "../../../../models/promotion.model";
import { getPaginationOptions } from "../../../../utils/pagination";
import {
  IdParams,
  PromotionCreateRequestBody,
  PromotionUpdateRequestBody,
  PromotionFlagRequestBody,
  PromotionRequestCreateRequestBody,
  PromotionRequestActionRequestBody,
  PaginationQuery,
} from "../../../../types/requests";

export const AdminPromotionController = () => {
  const GetAllPromotions = async (
    req: Request<never, never, never, PaginationQuery>,
    res: Response,
  ) => {
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
      } = req.query as any;

      // Build filter
      const filter: any = {};
      if (type) filter.type = type;
      if (targetAudience) filter.targetAudience = targetAudience;
      if (isActive !== undefined) filter.isActive = isActive === "true";
      if (isFlagged !== undefined) filter.isFlagged = isFlagged === "true";

      const paginationOptions = getPaginationOptions({
        page: page as string,
        limit: limit as string,
      });

      const promotions = await PromotionModel.paginate(filter, {
        ...paginationOptions,
        sort: { createdAt: -1 },
        populate: [{ path: "createdBy", select: "firstName lastName email" }],
      });

      return sendSuccessFeedback(res, "Promotions retrieved", {
        promotions: promotions.docs,
        pagination: {
          currentPage: promotions.page,
          totalPages: promotions.totalPages,
          totalDocs: promotions.totalDocs,
          hasNextPage: promotions.hasNextPage,
          hasPrevPage: promotions.hasPrevPage,
        },
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
        { path: "createdBy", select: "firstName lastName email" },
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
      const authorization = req.headers.authorization;

      if (!authorization) {
        return sendErrorFeedback(res, 401, "Unauthorized");
      }

      // Get admin from token
      const tokenData: any = jwt.verify(authorization, JWT_SECRET);
      const createdBy = tokenData.adminId;

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

      const updatedPromotion = await PromotionModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true },
      ).populate([{ path: "createdBy", select: "firstName lastName email" }]);

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

      const { id } = req.params;
      const { flagReason } = req.body;

      const promotion = await PromotionModel.findById(id);
      if (!promotion) {
        return sendErrorFeedback(res, 404, "Promotion not found");
      }

      await PromotionModel.findByIdAndUpdate(id, {
        isFlagged: true,
        flagReason: flagReason || "Flagged by admin",
      });

      return sendSuccessFeedback(res, "Promotion flagged successfully");
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

      await PromotionModel.findByIdAndUpdate(id, {
        isFlagged: false,
        flagReason: undefined,
      });

      return sendSuccessFeedback(res, "Promotion unflagged successfully");
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

      const { page = 1, limit = 20 } = req.query as any;

      const paginationOptions = getPaginationOptions({
        page: page as string,
        limit: limit as string,
      });

      const promotions = await PromotionModel.paginate(
        { isFlagged: true },
        {
          ...paginationOptions,
          sort: { createdAt: -1 },
          populate: [{ path: "createdBy", select: "firstName lastName email" }],
        },
      );

      return sendSuccessFeedback(res, "Flagged promotions retrieved", {
        promotions: promotions.docs,
        pagination: {
          currentPage: promotions.page,
          totalPages: promotions.totalPages,
          totalDocs: promotions.totalDocs,
          hasNextPage: promotions.hasNextPage,
          hasPrevPage: promotions.hasPrevPage,
        },
      });
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
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const totalPromotions = await PromotionModel.countDocuments();
      const activePromotions = await PromotionModel.countDocuments({
        isActive: true,
      });
      const flaggedPromotions = await PromotionModel.countDocuments({
        isFlagged: true,
      });
      const promotionsByType = await PromotionModel.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]);

      return sendSuccessFeedback(res, "Promotion statistics retrieved", {
        totalPromotions,
        activePromotions,
        flaggedPromotions,
        promotionsByType,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetUsersPromotions = async (
    req: Request<never, never, never, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { page = 1, limit = 20 } = req.query as any;

      const paginationOptions = getPaginationOptions({
        page: page as string,
        limit: limit as string,
      });

      const promotions = await PromotionModel.paginate(
        { isActive: true },
        {
          ...paginationOptions,
          sort: { createdAt: -1 },
          populate: [{ path: "createdBy", select: "firstName lastName email" }],
        },
      );

      return sendSuccessFeedback(res, "User promotions retrieved", {
        promotions: promotions.docs,
        pagination: {
          currentPage: promotions.page,
          totalPages: promotions.totalPages,
          totalDocs: promotions.totalDocs,
          hasNextPage: promotions.hasNextPage,
          hasPrevPage: promotions.hasPrevPage,
        },
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetSingleUserPromotion = async (
    req: Request<IdParams>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const promotion = await PromotionModel.findById(id).populate([
        { path: "createdBy", select: "firstName lastName email" },
      ]);

      if (!promotion) {
        return sendErrorFeedback(res, 404, "Promotion not found");
      }

      return sendSuccessFeedback(res, "User promotion retrieved", {
        promotion,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };
  const GetAllPromotionRequests = async (
    req: Request<never, never, never, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      // For now, this is a placeholder implementation
      // In a real implementation, you would have a PromotionRequest model
      return sendSuccessFeedback(res, "Promotion requests retrieved", {
        requests: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalDocs: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const ApprovePromotionRequest = async (
    req: Request<IdParams, never, PromotionRequestActionRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      // For now, this is a placeholder implementation
      return sendSuccessFeedback(
        res,
        "Promotion request approved successfully",
      );
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const RejectPromotionRequest = async (
    req: Request<IdParams, never, PromotionRequestActionRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;
      const { rejectionReason } = req.body;

      // For now, this is a placeholder implementation
      return sendSuccessFeedback(
        res,
        "Promotion request rejected successfully",
      );
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
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      // For now, this is a placeholder implementation
      return sendSuccessFeedback(res, "Promotion request details retrieved", {
        request: {
          id,
          title: "Sample Promotion Request",
          status: "pending",
        },
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
