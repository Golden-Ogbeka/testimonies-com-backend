import { Response } from "express";
import { validationResult } from "express-validator";
import {
  sendCatchFeedback,
  sendErrorFeedback,
  sendSuccessFeedback,
  sendValidationErrorFeedback,
} from "../../../../functions/feedback";
import AnalyticsCacheModel from "../../../../models/analytics-cache.model";
import OrganizationModel from "../../../../models/organization.model";
import UserModel from "../../../../models/user.model";
import { CustomRequest } from "../../../../types/express";
import {
  PaginationQuery,
  UserFilterQuery,
  UserUpdateRequestBody,
} from "../../../../types/requests";
import { getPaginationOptions } from "../../../../utils/pagination";

export const AdminUserController = () => {
  const GetAllUsers = async (
    req: CustomRequest<never, any, any, UserFilterQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { isActive, isFlagged, accountType, subscriptionType } = req.query;

      // Build filter
      const filter: Record<string, any> = {};
      if (isActive !== undefined) {
        filter.active =
          String(isActive).toLowerCase() === "true" || isActive === true;
      }
      if (isFlagged !== undefined) {
        filter.isFlagged =
          String(isFlagged).toLowerCase() === "true" || isFlagged === true;
      }
      if (accountType) filter.accountType = accountType;
      if (subscriptionType) filter.subscriptionType = subscriptionType;

      const paginationOptions = getPaginationOptions(req);

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

  const GetSingleUser = async (
    req: CustomRequest<{ id: string }>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      // Query both models in parallel
      const [user, organization] = await Promise.all([
        UserModel.findById(id),
        OrganizationModel.findById(id),
      ]);

      const foundUser = user || organization;
      if (!foundUser) {
        return sendErrorFeedback(res, 404, "User not found");
      }

      return sendSuccessFeedback(res, "User retrieved", {
        user: foundUser,
        userType: user ? "user" : "organization",
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const UpdateUser = async (
    req: CustomRequest<{ id: string }, any, UserUpdateRequestBody>,
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

  const DeactivateUser = async (
    req: CustomRequest<{ id: string }>,
    res: Response,
  ) => {
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

  const ActivateUser = async (
    req: CustomRequest<{ id: string }>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      // Query both models in parallel
      const [user, organization] = await Promise.all([
        UserModel.findById(id),
        OrganizationModel.findById(id),
      ]);

      const foundUser = user || organization;
      if (!foundUser) {
        return sendErrorFeedback(res, 404, "User not found");
      }

      foundUser.active = true;
      await foundUser.save();

      return sendSuccessFeedback(res, "User activated successfully", {
        user: foundUser,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetAllUsersProfileStats = async (
    req: CustomRequest<never, any, any, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const cache = await AnalyticsCacheModel.findOne({
        type: "admin_dashboard",
      });
      if (!cache)
        return sendErrorFeedback(
          res,
          404,
          "Analytics data not available yet. Please try again later.",
        );

      return sendSuccessFeedback(res, "User profile statistics retrieved", {
        totalUsers: cache.overview.totalUsers,
        activeUsers: cache.overview.activeUsers,
        flaggedUsers: cache.overview.flaggedUsers,
        verifiedUsers: cache.overview.verifiedUsers,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetUserProfileStats = async (
    req: CustomRequest<{ id: string }>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const user = await UserModel.findById(id);
      if (!user) {
        return sendErrorFeedback(res, 404, "User not found");
      }

      const cache = await AnalyticsCacheModel.findOne({
        type: "user_stats",
        userId: id,
      });

      if (!cache) {
        return sendErrorFeedback(
          res,
          404,
          "User stats not available yet. Please try again later.",
        );
      }

      return sendSuccessFeedback(res, "User profile statistics retrieved", {
        user,
        statistics: cache.userStats,
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
