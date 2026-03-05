import { Request, Response } from "express";
import {
  sendCatchFeedback,
  sendErrorFeedback,
  sendSuccessFeedback,
} from "../../../../functions/feedback";
import { IOrganization } from "../../../../models/organization.model";
import PromotionRequestModel from "../../../../models/promotion-request.model";
import PromotionModel from "../../../../models/promotion.model";
import { IUser } from "../../../../models/user.model";
import { getPaginationOptions } from "../../../../utils/pagination";

export const UserPromotionController = () => {
  const getUserIdAndType = (req: Request) => {
    const user = (req as any).user as IUser | IOrganization;
    const isOrg = user.accountType === "organization";
    return {
      userId: user._id as string,
      userType: isOrg ? "organization" : "user",
      user,
    };
  };

  const GetAllPromotions = async (req: Request, res: Response) => {
    try {
      const { userType, user } = getUserIdAndType(req);
      const { page, limit } = req.query as any;

      // Filter promotions based on the user's audience
      let targetAudiences = ["all"];
      if (userType === "organization") {
        targetAudiences.push("organizations");
      } else {
        targetAudiences.push("users");
        if ((user as IUser).subscriptionType === "premium") {
          targetAudiences.push("premium");
        } else {
          targetAudiences.push("basic");
        }
      }

      const options = getPaginationOptions(
        { query: { page, limit } },
        { createdAt: -1 },
      );

      // @ts-ignore
      const promotions = await PromotionModel.paginate(
        {
          isActive: true,
          isFlagged: false,
          targetAudience: { $in: targetAudiences },
        },
        options as any,
      );

      return sendSuccessFeedback(res, "Promotions retrieved successfully", {
        promotions,
      });
    } catch (error) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  const GetPromotion = async (req: Request, res: Response) => {
    try {
      const promotion = await PromotionModel.findOne({
        _id: req.params.id,
        isActive: true,
        isFlagged: false,
      });

      if (!promotion) return sendErrorFeedback(res, 404, "Promotion not found");

      return sendSuccessFeedback(res, "Promotion retrieved", { promotion });
    } catch (error) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  const CreatePromotion = async (req: Request, res: Response) => {
    try {
      // Users/Organizations "request" to create a promotion
      const { userId, userType } = getUserIdAndType(req);
      const { title, description, targetAudience, startDate, endDate } =
        req.body;

      if (!title || !description || !startDate) {
        return sendErrorFeedback(
          res,
          400,
          "Title, description, and start date are required",
        );
      }

      const request = await PromotionRequestModel.create({
        user: userId,
        userType,
        title,
        description,
        targetAudience,
        startDate,
        endDate,
      });

      return sendSuccessFeedback(
        res,
        "Promotion request created. Pending admin approval.",
        { request },
        201,
      );
    } catch (error) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  const UpdatePromotion = async (req: Request, res: Response) => {
    try {
      const { userId } = getUserIdAndType(req);
      const { title, description, targetAudience, startDate, endDate } =
        req.body;

      const request = await PromotionRequestModel.findOneAndUpdate(
        { _id: req.params.id, user: userId, status: "pending" },
        {
          ...(title && { title }),
          ...(description && { description }),
          ...(targetAudience && { targetAudience }),
          ...(startDate && { startDate }),
          ...(endDate && { endDate }),
        },
        { new: true },
      );

      if (!request)
        return sendErrorFeedback(
          res,
          404,
          "Pending promotion request not found or cannot be edited",
        );

      return sendSuccessFeedback(res, "Promotion request updated", { request });
    } catch (error) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  const DeactivatePromotion = async (req: Request, res: Response) => {
    try {
      // Users can't deactivate admin promotions, they can only deactivate their own approved ones,
      // but assuming they map to PromotionRequests being cancelled for now.
      return sendErrorFeedback(res, 403, "Cannot deactivate system promotions");
    } catch (error) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  const ActivatePromotion = async (req: Request, res: Response) => {
    try {
      return sendErrorFeedback(res, 403, "Cannot activate system promotions");
    } catch (error) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  const DeletePromotion = async (req: Request, res: Response) => {
    try {
      return sendErrorFeedback(res, 403, "Cannot delete system promotions");
    } catch (error) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  const GetPromotionRequests = async (req: Request, res: Response) => {
    try {
      const { userId } = getUserIdAndType(req);
      const { page, limit } = req.query as any;

      const options = getPaginationOptions(
        { query: { page, limit } },
        { createdAt: -1 },
      );

      // @ts-ignore
      const requests = await PromotionRequestModel.paginate(
        { user: userId },
        options as any,
      );

      return sendSuccessFeedback(res, "Promotion requests retrieved", {
        requests,
      });
    } catch (error) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  const DeletePromotionRequest = async (req: Request, res: Response) => {
    try {
      const { userId } = getUserIdAndType(req);

      const request = await PromotionRequestModel.findOneAndDelete({
        _id: req.params.id,
        user: userId,
        status: "pending", // Can only delete pending requests
      });

      if (!request)
        return sendErrorFeedback(
          res,
          404,
          "Pending promotion request not found",
        );

      return sendSuccessFeedback(res, "Promotion request deleted securely");
    } catch (error) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  const GetPromotionStats = async (req: Request, res: Response) => {
    try {
      // Simulate stats
      return sendSuccessFeedback(res, "Promotion stats retrieved", {
        views: 120,
        clicks: 45,
        conversionRate: "37.5%",
      });
    } catch (error) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  const GetPromotionForAd = async (req: Request, res: Response) => {
    try {
      // Get a random active promotion for ad display
      const { userType, user } = getUserIdAndType(req);

      let targetAudiences = ["all"];
      if (userType === "organization") {
        targetAudiences.push("organizations");
      } else {
        targetAudiences.push("users");
        if ((user as IUser).subscriptionType === "premium") {
          targetAudiences.push("premium");
        } else {
          targetAudiences.push("basic");
        }
      }

      // MongoDB aggregation for a random document
      const promotion = await PromotionModel.aggregate([
        {
          $match: {
            isActive: true,
            isFlagged: false,
            targetAudience: { $in: targetAudiences },
          },
        },
        { $sample: { size: 1 } },
      ]);

      if (!promotion || promotion.length === 0) {
        return sendErrorFeedback(
          res,
          404,
          "No active promotions found for ads",
        );
      }

      return sendSuccessFeedback(res, "Ad promotion retrieved", {
        promotion: promotion[0],
      });
    } catch (error) {
      return sendCatchFeedback(res, error as Error);
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
