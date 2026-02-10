import { Request, Response } from "express";
import { validationResult } from "express-validator";
import {
  sendCatchFeedback,
  sendErrorFeedback,
  sendSuccessFeedback,
  sendValidationErrorFeedback,
} from "../../../../functions/feedback";
import UserModel from "../../../../models/user.model";
import OrganizationModel from "../../../../models/organization.model";
import { getPaginationOptions } from "../../../../utils/pagination";
import {
  IdParams,
  UserUpdateRequestBody,
  KYCActionRequestBody,
  UserFilterQuery,
  PaginationQuery,
} from "../../../../types/requests";

export const AdminUserController = () => {
  const GetAllUsers = async (
    req: Request<never, never, never, UserFilterQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const {
        page = 1,
        limit = 20,
        isActive,
        isFlagged,
        accountType,
        subscriptionType,
      } = req.query as any;

      // Build filter
      const filter: any = {};
      if (isActive !== undefined) filter.active = isActive === "true";
      if (isFlagged !== undefined) filter.isFlagged = isFlagged === "true";
      if (accountType) filter.accountType = accountType;
      if (subscriptionType) filter.subscriptionType = subscriptionType;

      const paginationOptions = getPaginationOptions({
        page: page as string,
        limit: limit as string,
      });

      const users = await UserModel.paginate(filter, {
        ...paginationOptions,
        sort: { createdAt: -1 },
        select: "-password -verificationCode -resetPasswordToken",
      });

      return sendSuccessFeedback(res, "Users retrieved", {
        users: users.docs,
        pagination: {
          currentPage: users.page,
          totalPages: users.totalPages,
          totalDocs: users.totalDocs,
          hasNextPage: users.hasNextPage,
          hasPrevPage: users.hasPrevPage,
        },
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

      const user = await UserModel.findById(id).select(
        "-password -verificationCode -resetPasswordToken",
      );
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
      const {
        firstName,
        lastName,
        email,
        phoneNumber,
        profileImage,
        bio,
        profileVisibility,
        isFlagged,
      } = req.body;

      const user = await UserModel.findById(id);
      if (!user) {
        return sendErrorFeedback(res, 404, "User not found");
      }

      // Check if email is being changed and if it's already in use
      if (email && email !== user.email) {
        const existingUser = await UserModel.findOne({
          email,
          _id: { $ne: id },
        });
        if (existingUser) {
          return sendErrorFeedback(res, 409, "Email is already in use");
        }
        const existingOrg = await OrganizationModel.findOne({
          businessEmail: email,
          _id: { $ne: id },
        });
        if (existingOrg) {
          return sendErrorFeedback(res, 409, "Email is already in use");
        }
      }

      const updateData: any = {};
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (email) updateData.email = email;
      if (phoneNumber) updateData.phoneNumber = phoneNumber;
      if (profileImage) updateData.profileImage = profileImage;
      if (bio) updateData.bio = bio;
      if (profileVisibility) updateData.profileVisibility = profileVisibility;
      if (isFlagged !== undefined) updateData.isFlagged = isFlagged;

      const updatedUser = await UserModel.findByIdAndUpdate(id, updateData, {
        new: true,
      }).select("-password -verificationCode -resetPasswordToken");

      return sendSuccessFeedback(res, "User updated successfully", {
        user: updatedUser,
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

      const user = await UserModel.findById(id);
      if (!user) {
        return sendErrorFeedback(res, 404, "User not found");
      }

      await UserModel.findByIdAndUpdate(id, { active: false });

      return sendSuccessFeedback(res, "User deactivated successfully");
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

      await UserModel.findByIdAndUpdate(id, { active: true });

      return sendSuccessFeedback(res, "User activated successfully");
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetAllUserKYCApplications = async (req: Request, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { page = 1, limit = 20, status } = req.query as any;

      // Build filter
      const filter: any = {};
      if (status) filter.kycStatus = status;

      const paginationOptions = getPaginationOptions({
        page: page as string,
        limit: limit as string,
      });

      const users = await UserModel.paginate(filter, {
        ...paginationOptions,
        sort: { createdAt: -1 },
        select:
          "firstName lastName email username kycStatus kycDocuments kycSubmittedAt",
      });

      return sendSuccessFeedback(res, "KYC applications retrieved", {
        applications: users.docs,
        pagination: {
          currentPage: users.page,
          totalPages: users.totalPages,
          totalDocs: users.totalDocs,
          hasNextPage: users.hasNextPage,
          hasPrevPage: users.hasPrevPage,
        },
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetUserKYCApplication = async (req: Request, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const user = await UserModel.findById(id).select(
        "firstName lastName email username kycStatus kycDocuments kycSubmittedAt kycReviewedAt kycReviewedBy kycRejectionReason",
      );
      if (!user) {
        return sendErrorFeedback(res, 404, "User not found");
      }

      return sendSuccessFeedback(res, "KYC application retrieved", {
        application: user,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const ApproveUserKYCApplication = async (
    req: Request<IdParams, never, KYCActionRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;
      const { adminId } = req.body;

      const user = await UserModel.findById(id);
      if (!user) {
        return sendErrorFeedback(res, 404, "User not found");
      }

      await UserModel.findByIdAndUpdate(id, {
        kycStatus: "approved",
        kycReviewedAt: new Date(),
        kycReviewedBy: adminId,
        kycRejectionReason: undefined,
      });

      return sendSuccessFeedback(res, "KYC application approved successfully");
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const RejectUserKYCApplication = async (
    req: Request<IdParams, never, KYCActionRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;
      const { adminId, reason } = req.body;

      const user = await UserModel.findById(id);
      if (!user) {
        return sendErrorFeedback(res, 404, "User not found");
      }

      await UserModel.findByIdAndUpdate(id, {
        kycStatus: "rejected",
        kycReviewedAt: new Date(),
        kycReviewedBy: adminId,
        kycRejectionReason: reason || "Rejected by admin",
      });

      return sendSuccessFeedback(res, "KYC application rejected successfully");
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
      const kycApprovedUsers = await UserModel.countDocuments({
        kycStatus: "approved",
      });
      const kycPendingUsers = await UserModel.countDocuments({
        kycStatus: "pending",
      });
      const kycRejectedUsers = await UserModel.countDocuments({
        kycStatus: "rejected",
      });

      return sendSuccessFeedback(res, "User profile statistics retrieved", {
        totalUsers,
        activeUsers,
        flaggedUsers,
        verifiedUsers,
        kycApprovedUsers,
        kycPendingUsers,
        kycRejectedUsers,
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
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          active: user.active,
          isFlagged: user.isFlagged,
          emailIsVerified: user.emailIsVerified,
          kycStatus: user.kycStatus,
          createdAt: user.createdAt,
        },
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

  const GetAllUserMessageStats = async (
    req: Request<never, never, never, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      // For now, this is a placeholder implementation
      // In a real implementation, you would have a Message model
      return sendSuccessFeedback(res, "User message statistics retrieved", {
        totalMessages: 0,
        sentMessages: 0,
        receivedMessages: 0,
        unreadMessages: 0,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetUserMessageStats = async (req: Request<IdParams>, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      // For now, this is a placeholder implementation
      return sendSuccessFeedback(res, "User message statistics retrieved", {
        userId: id,
        totalMessages: 0,
        sentMessages: 0,
        receivedMessages: 0,
        unreadMessages: 0,
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
    GetAllUserKYCApplications,
    GetUserKYCApplication,
    ApproveUserKYCApplication,
    RejectUserKYCApplication,
    GetAllUsersProfileStats,
    GetUserProfileStats,
    GetAllUserMessageStats,
    GetUserMessageStats,
  };
};
