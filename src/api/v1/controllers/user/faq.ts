import { Request, Response } from "express";
import {
  sendCatchFeedback,
  sendSuccessFeedback,
} from "../../../../functions/feedback";
import FAQModel from "../../../../models/faq.model";
import { getPaginationOptions } from "../../../../utils/pagination";

export const UserFaqController = () => {
  const GetActiveFaqs = async (req: Request, res: Response) => {
    try {
      const { page, limit } = req.query as any;
      const options = getPaginationOptions(
        { query: { page, limit } },
        { order: 1, createdAt: -1 },
      );

      const query = { isActive: true };

      const faqs = await FAQModel.paginate(query, options as any);

      return sendSuccessFeedback(res, "Active FAQs retrieved successfully", {
        faqs,
      });
    } catch (error) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  return {
    GetActiveFaqs,
  };
};
