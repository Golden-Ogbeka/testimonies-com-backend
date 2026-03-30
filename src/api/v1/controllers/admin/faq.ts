import { Response } from "express";
import { validationResult } from "express-validator";
import { getAdminUserDetails } from "../../../../functions/auth";
import {
  sendCatchFeedback,
  sendErrorFeedback,
  sendSuccessFeedback,
  sendValidationErrorFeedback,
} from "../../../../functions/feedback";
import FAQModel from "../../../../models/faq.model";
import { CustomRequest } from "../../../../types/express";
import {
  FAQCreateRequestBody,
  FAQUpdateRequestBody,
  IdParams,
  PaginationQuery,
} from "../../../../types/requests";
import { getPaginationOptions } from "../../../../utils/pagination";

export const AdminFaqController = () => {
  const CreateFaq = async (
    req: CustomRequest<never, any, FAQCreateRequestBody>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { question, answer, order } = req.body;
      const adminDetails = await getAdminUserDetails(req);
      const adminId = adminDetails._id;

      const existingFaq = await FAQModel.findOne({ question });
      if (existingFaq) {
        return sendErrorFeedback(
          res,
          409,
          "A FAQ with this question already exists.",
        );
      }

      const newFaq = await FAQModel.create({
        question,
        answer,
        order: order || 0,
        createdBy: adminId,
        updatedBy: adminId,
      });

      return sendSuccessFeedback(
        res,
        "FAQ created successfully",
        {
          faq: newFaq,
        },
        201,
      );
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetFaqs = async (
    req: CustomRequest<never, any, any, PaginationQuery>,
    res: Response,
  ) => {
    try {
      const { isActive } = req.query;
      const options = getPaginationOptions(req, { order: 1, createdAt: -1 }, [
        { path: "createdByDetails", select: "firstName lastName email" },
        { path: "updatedByDetails", select: "firstName lastName email" },
      ]);

      const query: Record<string, any> =
        isActive !== undefined ? { isActive } : {};

      const faqs = await FAQModel.paginate(query, options);

      return sendSuccessFeedback(res, "FAQs retrieved successfully", {
        faqs,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const UpdateFaq = async (
    req: CustomRequest<IdParams, any, FAQUpdateRequestBody>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;
      const { question, answer, order } = req.body;
      const adminDetails = await getAdminUserDetails(req);
      const adminId = adminDetails._id;

      const faq = await FAQModel.findById(id);
      if (!faq) {
        return sendErrorFeedback(res, 404, "FAQ not found");
      }

      if (question && question !== faq.question) {
        const existingFaq = await FAQModel.findOne({ question });
        if (existingFaq) {
          return sendErrorFeedback(
            res,
            409,
            "A FAQ with this question already exists.",
          );
        }
      }

      const updatedFaq = await FAQModel.findByIdAndUpdate(
        id,
        {
          $set: {
            ...(question && { question }),
            ...(answer && { answer }),
            ...(order !== undefined && { order }),
            updatedBy: adminId,
          },
        },
        { new: true, runValidators: true },
      ).populate("updatedByDetails", "firstName lastName email");

      return sendSuccessFeedback(res, "FAQ updated successfully", {
        faq: updatedFaq,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const ToggleFaqStatus = async (
    req: CustomRequest<IdParams, any, { isActive: boolean }>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;
      const { isActive } = req.body;
      const adminDetails = await getAdminUserDetails(req);
      const adminId = adminDetails._id;

      const faq = await FAQModel.findByIdAndUpdate(
        id,
        {
          isActive,
          updatedBy: adminId,
        },
        { new: true },
      );

      if (!faq) {
        return sendErrorFeedback(res, 404, "FAQ not found");
      }

      return sendSuccessFeedback(
        res,
        `FAQ ${isActive ? "activated" : "deactivated"} successfully`,
        { faq },
      );
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const DeleteFaq = async (req: CustomRequest<IdParams>, res: Response) => {
    try {
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

  return {
    CreateFaq,
    GetFaqs,
    UpdateFaq,
    ToggleFaqStatus,
    DeleteFaq,
  };
};
