import { Request, Response } from "express";
import { validationResult } from "express-validator";
import {
  sendCatchFeedback,
  sendErrorFeedback,
  sendSuccessFeedback,
  sendValidationErrorFeedback,
} from "../../../../functions/feedback";
import FAQModel from "../../../../models/faq.model";
import SystemContentModel from "../../../../models/system-content.model";
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

      const { question, answer, category, order } = req.body;

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
        category,
        order: order || 0,
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
      const { question, answer, category, order, isActive } = req.body;

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

      const updateData: any = {};
      if (question) updateData.question = question;
      if (answer) updateData.answer = answer;
      if (category) updateData.category = category;
      if (order !== undefined) updateData.order = order;
      if (isActive !== undefined) updateData.isActive = isActive;

      const updatedFAQ = await FAQModel.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      return sendSuccessFeedback(res, "FAQ updated successfully", {
        faq: updatedFAQ,
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

      const faq = await FAQModel.findById(id);
      if (!faq) {
        return sendErrorFeedback(res, 404, "FAQ not found");
      }

      await FAQModel.findByIdAndDelete(id);

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

      const { page = 1, limit = 20, category, isActive } = req.query as any;

      // Build filter
      const filter: any = {};
      if (category) filter.category = category;
      if (isActive !== undefined) filter.isActive = isActive === "true";

      const paginationOptions = getPaginationOptions({
        page: page as string,
        limit: limit as string,
      });

      const faqs = await FAQModel.paginate(filter, {
        ...paginationOptions,
        sort: { order: 1, createdAt: -1 },
      });

      return sendSuccessFeedback(res, "FAQs retrieved", {
        faqs: faqs.docs,
        pagination: {
          currentPage: faqs.page,
          totalPages: faqs.totalPages,
          totalDocs: faqs.totalDocs,
          hasNextPage: faqs.hasNextPage,
          hasPrevPage: faqs.hasPrevPage,
        },
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

      const updatedContent = await SystemContentModel.findOneAndUpdate(
        { type: "privacy_policy" },
        {
          title,
          content,
          version: version || "1.0",
          updatedAt: new Date(),
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

      const updatedContent = await SystemContentModel.findOneAndUpdate(
        { type: "terms_of_service" },
        {
          title,
          content,
          version: version || "1.0",
          updatedAt: new Date(),
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

      const updatedContent = await SystemContentModel.findOneAndUpdate(
        { type: "community_guidelines" },
        {
          title,
          content,
          version: version || "1.0",
          updatedAt: new Date(),
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

  const CreateTeamPermissions = async (req: Request, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { teamName, permissions, description } = req.body;

      // For now, this is a placeholder implementation
      // In a real implementation, you would have a TeamPermission model
      return sendSuccessFeedback(res, "Team permissions created successfully", {
        teamPermissions: {
          teamName,
          permissions,
          description,
          createdAt: new Date(),
        },
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const UpdateTeamPermissions = async (
    req: Request<IdParams, never, TeamPermissionUpdateRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;
      const { teamName, permissions, description } = req.body;

      // For now, this is a placeholder implementation
      return sendSuccessFeedback(res, "Team permissions updated successfully", {
        teamPermissions: {
          id,
          teamName,
          permissions,
          description,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const DeleteTeamPermissions = async (req: Request, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      // For now, this is a placeholder implementation
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

      const { page = 1, limit = 20 } = req.query as any;

      // For now, this is a placeholder implementation
      const paginationOptions = getPaginationOptions({
        page: page as string,
        limit: limit as string,
      });

      return sendSuccessFeedback(res, "Team permissions retrieved", {
        teamPermissions: [],
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

  const GetSingleTeamPermission = async (req: Request, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      // For now, this is a placeholder implementation
      return sendSuccessFeedback(res, "Team permission retrieved", {
        teamPermission: {
          id,
          teamName: "Sample Team",
          permissions: ["read", "write"],
          description: "Sample team permissions",
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
    UpdateTeamPermissions,
    CreateTeamPermissions,
    DeleteTeamPermissions,
    GetAllTeamPermissions,
    GetSingleTeamPermission,
  };
};
