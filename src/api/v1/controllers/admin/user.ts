import { Request, Response } from "express";
import { validationResult } from "express-validator";
import {
  sendCatchFeedback,
  sendErrorFeedback,
  sendSuccessFeedback,
  sendValidationErrorFeedback,
} from "../../../../functions/feedback";
import OrganizationModel from "../../../../models/organization.model";
import TestimonyLikeModel from "../../../../models/testimony-like.model";
import TestimonyReplyModel from "../../../../models/testimony-reply.model";
import TestimonyViewModel from "../../../../models/testimony-view.model";
import TestimonyModel from "../../../../models/testimony.model";
import UserModel from "../../../../models/user.model";
import {
  IdParams,
  PaginationQuery,
  UserFilterQuery,
  UserUpdateRequestBody,
} from "../../../../types/requests";
import { getPaginationOptions } from "../../../../utils/pagination";

export const AdminUserController = () => {
  const GetAllUsers = async (
    req: Request<never, never, never, UserFilterQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { isActive, isFlagged, accountType, subscriptionType } = req.query;

      // Build filter
      const filter: any = {};
      if (isActive !== undefined) filter.active = isActive;
      if (isFlagged !== undefined) filter.isFlagged = isFlagged;
      if (accountType) filter.accountType = accountType;
      if (subscriptionType) filter.subscriptionType = subscriptionType;

      const paginationOptions = getPaginationOptions(req as any);

      const users = await UserModel.paginate(filter, {
        ...paginationOptions,
        sort: { createdAt: -1 },
      });

      const organizations = await OrganizationModel.paginate(filter, {
        ...paginationOptions,
        sort: { createdAt: -1 },
      });

      return sendSuccessFeedback(res, "Users retrieved", {
        users,
        organizations,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetSingleUser = async (req: Request<IdParams>, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const user =
        (await UserModel.findById(id)) ||
        (await OrganizationModel.findById(id));
      if (!user) {
        return sendErrorFeedback(res, 404, "User not found");
      }

      return sendSuccessFeedback(res, "User retrieved", { user });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const UpdateUser = async (
    req: Request<IdParams, never, UserUpdateRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;
      const { isFlagged } = req.body;

      const user =
        (await UserModel.findById(id)) ||
        (await OrganizationModel.findById(id));
      if (!user) {
        return sendErrorFeedback(res, 404, "User not found");
      }

      user.isFlagged = isFlagged || user.isFlagged;

      await user.save();

      return sendSuccessFeedback(res, "User updated successfully", {
        user,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const DeactivateUser = async (req: Request<IdParams>, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const user =
        (await UserModel.findById(id)) ||
        (await OrganizationModel.findById(id));
      if (!user) {
        return sendErrorFeedback(res, 404, "User not found");
      }

      user.active = false;

      await user.save();

      return sendSuccessFeedback(res, "User deactivated successfully", {
        user,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const ActivateUser = async (req: Request<IdParams>, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const user = await UserModel.findById(id);
      if (!user) {
        return sendErrorFeedback(res, 404, "User not found");
      }
      user.active = true;
      await user.save();

      return sendSuccessFeedback(res, "User activated successfully", {
        user,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetAllUsersProfileStats = async (
    req: Request<never, never, never, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const totalUsers = await UserModel.countDocuments();
      const activeUsers = await UserModel.countDocuments({ active: true });
      const flaggedUsers = await UserModel.countDocuments({ isFlagged: true });
      const verifiedUsers = await UserModel.countDocuments({
        emailIsVerified: true,
      });

      return sendSuccessFeedback(res, "User profile statistics retrieved", {
        totalUsers,
        activeUsers,
        flaggedUsers,
        verifiedUsers,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetUserProfileStats = async (req: Request<IdParams>, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const user = await UserModel.findById(id);
      if (!user) {
        return sendErrorFeedback(res, 404, "User not found");
      }

      // Get user-specific statistics
      const testimoniesCount = await TestimonyModel.countDocuments({
        userId: id,
      });
      const likesCount = await TestimonyLikeModel.countDocuments({
        userId: id,
      });
      const repliesCount = await TestimonyReplyModel.countDocuments({
        userId: id,
      });
      const viewsCount = await TestimonyViewModel.countDocuments({
        userId: id,
      });

      return sendSuccessFeedback(res, "User profile statistics retrieved", {
        user,
        statistics: {
          testimoniesCount,
          likesCount,
          repliesCount,
          viewsCount,
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
    GetAllUsers,
    GetSingleUser,
    UpdateUser,
    DeactivateUser,
    ActivateUser,
    GetAllUsersProfileStats,
    GetUserProfileStats,
  };
};
