import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { Types } from "mongoose";
import { getAdminUserDetails } from "../../../../functions/auth";
import {
  sendCatchFeedback,
  sendErrorFeedback,
  sendSuccessFeedback,
  sendValidationErrorFeedback,
} from "../../../../functions/feedback";
import FAQModel from "../../../../models/faq.model";
import SystemContentModel from "../../../../models/system-content.model";
import TeamPermissionModel from "../../../../models/team-permission.model";
import {
  FAQCreateRequestBody,
  FAQUpdateRequestBody,
  IdParams,
  PaginationQuery,
  SystemContentUpdateRequestBody,
  TeamPermissionUpdateRequestBody,
} from "../../../../types/requests";
import { getPaginationOptions } from "../../../../utils/pagination";

export const AdminDataManagementController = () => {
  const AddFAQ = async (
    req: Request<never, never, FAQCreateRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { question, answer, order } = req.body;
      const adminDetails = await getAdminUserDetails(req as any);

      // Check if FAQ with same question already exists
      const existingFAQ = await FAQModel.findOne({ question });
      if (existingFAQ) {
        return sendErrorFeedback(
          res,
          409,
          "FAQ with this question already exists",
        );
      }

      const faq = await FAQModel.create({
        question,
        answer,
        order: order || 0,
        createdBy: adminDetails._id,
      });

      return sendSuccessFeedback(res, "FAQ created successfully", { faq });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const UpdateFAQ = async (
    req: Request<IdParams, never, FAQUpdateRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;
      const { question, answer, order, isActive } = req.body;
      const adminDetails = await getAdminUserDetails(req as any);

      const faq = await FAQModel.findById(id);
      if (!faq) {
        return sendErrorFeedback(res, 404, "FAQ not found");
      }

      // Check if another FAQ with same question exists
      if (question && question !== faq.question) {
        const existingFAQ = await FAQModel.findOne({
          question,
          _id: { $ne: id },
        });
        if (existingFAQ) {
          return sendErrorFeedback(
            res,
            409,
            "FAQ with this question already exists",
          );
        }
      }

      faq.question = question || faq.question;
      faq.answer = answer || faq.answer;
      faq.order = order !== undefined ? order : faq.order;
      faq.isActive = isActive !== undefined ? isActive : faq.isActive;
      faq.updatedBy = adminDetails._id as Types.ObjectId;

      await faq.save();

      return sendSuccessFeedback(res, "FAQ updated successfully", {
        faq,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const DeleteFAQ = async (req: Request<IdParams>, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const faq = await FAQModel.findByIdAndDelete(id);
      if (!faq) {
        return sendErrorFeedback(res, 404, "FAQ not found");
      }

      return sendSuccessFeedback(res, "FAQ deleted successfully");
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetAllFAQs = async (
    req: Request<never, never, never, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { isActive } = req.query as any;

      // Build filter
      const filter: any = {};
      if (isActive !== undefined) filter.isActive = isActive === "true";

      const paginationOptions = getPaginationOptions(req as any);

      const faqs = await FAQModel.paginate(filter, {
        ...paginationOptions,
        sort: { order: 1, createdAt: -1 },
      });

      return sendSuccessFeedback(res, "FAQs retrieved", {
        faqs,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetSingleFAQ = async (
    req: Request<IdParams, never, never, never>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const faq = await FAQModel.findById(id);
      if (!faq) {
        return sendErrorFeedback(res, 404, "FAQ not found");
      }

      return sendSuccessFeedback(res, "FAQ retrieved", { faq });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetPrivacyPolicy = async (
    req: Request<never, never, never, never>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const privacyPolicy = await SystemContentModel.findOne({
        type: "privacy_policy",
        isActive: true,
      });

      if (!privacyPolicy) {
        return sendErrorFeedback(res, 404, "Privacy policy not found");
      }

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

  const GetTermsOfService = async (
    req: Request<never, never, never, never>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const termsOfService = await SystemContentModel.findOne({
        type: "terms_of_service",
        isActive: true,
      });

      if (!termsOfService) {
        return sendErrorFeedback(res, 404, "Terms of service not found");
      }

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

  const GetCommunityGuidelines = async (
    req: Request<never, never, never, never>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const communityGuidelines = await SystemContentModel.findOne({
        type: "community_guidelines",
        isActive: true,
      });

      if (!communityGuidelines) {
        return sendErrorFeedback(res, 404, "Community guidelines not found");
      }

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
    req: Request<never, never, SystemContentUpdateRequestBody, never>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { title, content, version } = req.body;
      const adminDetails = await getAdminUserDetails(req as any);

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

  const UpdateTermsOfService = async (req: Request, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { title, content, version } = req.body;
      const adminDetails = await getAdminUserDetails(req as any);

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

  const UpdateCommunityGuidelines = async (req: Request, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { title, content, version } = req.body;
      const adminDetails = await getAdminUserDetails(req as any);

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

  const CreateTeamPermission = async (req: Request, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const adminDetails = await getAdminUserDetails(req as any);
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
    req: Request<IdParams, never, TeamPermissionUpdateRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;
      const { permission, description } = req.body;

      const adminDetails = await getAdminUserDetails(req as any);

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

  const DeleteTeamPermission = async (req: Request, res: Response) => {
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

  const GetAllTeamPermissions = async (req: Request, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const paginationOptions = getPaginationOptions(req as any);

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

  const GetSingleTeamPermission = async (req: Request, res: Response) => {
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
    AddFAQ,
    UpdateFAQ,
    DeleteFAQ,
    GetAllFAQs,
    GetSingleFAQ,
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
