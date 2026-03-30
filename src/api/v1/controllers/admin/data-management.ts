import { Response } from "express";
import { validationResult } from "express-validator";
import { Types } from "mongoose";
import { getAdminUserDetails } from "../../../../functions/auth";
import {
  sendCatchFeedback,
  sendErrorFeedback,
  sendSuccessFeedback,
  sendValidationErrorFeedback,
} from "../../../../functions/feedback";
import SystemContentModel from "../../../../models/system-content.model";
import TeamPermissionModel from "../../../../models/team-permission.model";
import { CustomRequest } from "../../../../types/express";
import {
  IdParams,
  PaginationQuery,
  SystemContentUpdateRequestBody,
  TeamPermissionUpdateRequestBody,
} from "../../../../types/requests";
import { getPaginationOptions } from "../../../../utils/pagination";

export const AdminDataManagementController = () => {
  const GetPrivacyPolicy = async (req: CustomRequest, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const privacyPolicy = await SystemContentModel.findOne({
        type: "privacy_policy",
        isActive: true,
      });

      return sendSuccessFeedback(res, "Privacy policy retrieved", {
        content: privacyPolicy,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetTermsOfService = async (req: CustomRequest, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const termsOfService = await SystemContentModel.findOne({
        type: "terms_of_service",
        isActive: true,
      });

      return sendSuccessFeedback(res, "Terms of service retrieved", {
        content: termsOfService,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetCommunityGuidelines = async (req: CustomRequest, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const communityGuidelines = await SystemContentModel.findOne({
        type: "community_guidelines",
        isActive: true,
      });

      return sendSuccessFeedback(res, "Community guidelines retrieved", {
        content: communityGuidelines,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const UpdatePrivacyPolicy = async (
    req: CustomRequest<never, any, SystemContentUpdateRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { title, content, version } = req.body;
      const adminDetails = await getAdminUserDetails(req);

      const updatedContent = await SystemContentModel.findOneAndUpdate(
        { type: "privacy_policy" },
        {
          title,
          content,
          createdBy: adminDetails._id,
          updatedBy: adminDetails._id,
          ...(version && { version }),
        },
        { upsert: true, new: true },
      );

      return sendSuccessFeedback(res, "Privacy policy updated successfully", {
        content: updatedContent,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const UpdateTermsOfService = async (
    req: CustomRequest<never, any, SystemContentUpdateRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { title, content, version } = req.body;
      const adminDetails = await getAdminUserDetails(req);

      const updatedContent = await SystemContentModel.findOneAndUpdate(
        { type: "terms_of_service" },
        {
          title,
          content,
          createdBy: adminDetails._id,
          updatedBy: adminDetails._id,
          ...(version && { version }),
        },
        { upsert: true, new: true },
      );

      return sendSuccessFeedback(res, "Terms of service updated successfully", {
        content: updatedContent,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const UpdateCommunityGuidelines = async (
    req: CustomRequest<never, any, SystemContentUpdateRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { title, content, version } = req.body;
      const adminDetails = await getAdminUserDetails(req);

      const updatedContent = await SystemContentModel.findOneAndUpdate(
        { type: "community_guidelines" },
        {
          title,
          content,
          createdBy: adminDetails._id,
          updatedBy: adminDetails._id,
          ...(version && { version }),
        },
        { upsert: true, new: true },
      );

      return sendSuccessFeedback(
        res,
        "Community guidelines updated successfully",
        { content: updatedContent },
      );
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const CreateTeamPermission = async (
    req: CustomRequest<never, any, { permission: string; description: string }>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const adminDetails = await getAdminUserDetails(req);
      const { permission, description } = req.body;

      const existingPermission = await TeamPermissionModel.findOne({
        permission,
      });

      if (existingPermission) {
        return sendErrorFeedback(res, 400, "Permission already exists");
      }

      const teamPermission = await TeamPermissionModel.create({
        name: permission,
        description,
        createdBy: adminDetails._id,
      });

      return sendSuccessFeedback(res, "Team permissions created successfully", {
        teamPermission,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const UpdateTeamPermission = async (
    req: CustomRequest<IdParams, any, TeamPermissionUpdateRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;
      const { permission, description } = req.body;

      const adminDetails = await getAdminUserDetails(req);

      const teamPermission = await TeamPermissionModel.findById(id);
      if (!teamPermission) {
        return sendErrorFeedback(res, 404, "Team permission not found");
      }

      teamPermission.name = permission || teamPermission.name;
      teamPermission.description = description || teamPermission.description;
      teamPermission.updatedBy = adminDetails._id as Types.ObjectId;

      await teamPermission.save();

      return sendSuccessFeedback(res, "Team permissions updated successfully", {
        teamPermission,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const DeleteTeamPermission = async (
    req: CustomRequest<IdParams>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const teamPermission = await TeamPermissionModel.findByIdAndDelete(id);
      if (!teamPermission) {
        return sendErrorFeedback(res, 404, "Team permission not found");
      }

      return sendSuccessFeedback(res, "Team permissions deleted successfully");
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetAllTeamPermissions = async (
    req: CustomRequest<never, any, any, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const paginationOptions = getPaginationOptions(req);

      const teamPermissions = await TeamPermissionModel.paginate(
        {},
        {
          ...paginationOptions,
          sort: { order: 1, createdAt: -1 },
        },
      );

      return sendSuccessFeedback(res, "Team permissions retrieved", {
        teamPermissions,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetSingleTeamPermission = async (
    req: CustomRequest<IdParams>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const teamPermission = await TeamPermissionModel.findById(id);
      if (!teamPermission) {
        return sendErrorFeedback(res, 404, "Team permission not found");
      }

      return sendSuccessFeedback(res, "Team permission retrieved", {
        teamPermission,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  return {
    GetPrivacyPolicy,
    GetTermsOfService,
    GetCommunityGuidelines,
    UpdatePrivacyPolicy,
    UpdateTermsOfService,
    UpdateCommunityGuidelines,
    UpdateTeamPermission,
    CreateTeamPermission,
    DeleteTeamPermission,
    GetAllTeamPermissions,
    GetSingleTeamPermission,
  };
};
