import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { getAdminUserDetails } from "../../../../functions/auth";
import {
  sendCatchFeedback,
  sendErrorFeedback,
  sendSuccessFeedback,
  sendValidationErrorFeedback,
} from "../../../../functions/feedback";
import TestimonyModel from "../../../../models/testimony.model";
import {
  IdParams,
  PaginationQuery,
  TestimonyFilterQuery,
  TestimonyFlagRequestBody,
  TestimonyUnflagRequestBody,
} from "../../../../types/requests";
import { getPaginationOptions } from "../../../../utils/pagination";

export const AdminTestimonyController = () => {
  const GetTestimonyDetails = async (req: Request<IdParams>, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const testimony = await TestimonyModel.findById(id).populate([
        "userDetails",
        "broadcastOrganizationDetails",
        "flaggedByDetails",
      ]);

      if (!testimony) {
        return sendErrorFeedback(res, 404, "Testimony not found");
      }

      return sendSuccessFeedback(res, "Testimony details retrieved", {
        testimony,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetTestimonyWithHighestEngagement = async (
    req: Request,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { limit = 10 } = req.query as any;

      // Get testimonies with highest engagement (likes + replies + views)
      const testimonies = await TestimonyModel.aggregate([
        {
          $lookup: {
            from: "testimonylikes",
            localField: "_id",
            foreignField: "testimonyId",
            as: "likes",
          },
        },
        {
          $lookup: {
            from: "testimonyreplies",
            localField: "_id",
            foreignField: "testimonyId",
            as: "replies",
          },
        },
        {
          $lookup: {
            from: "testimonyviews",
            localField: "_id",
            foreignField: "testimonyId",
            as: "views",
          },
        },
        {
          $addFields: {
            engagementScore: {
              $add: [
                { $size: "$likes" },
                { $size: "$replies" },
                { $size: "$views" },
              ],
            },
          },
        },
        { $sort: { engagementScore: -1 } },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $project: {
            content: 1,
            createdAt: 1,
            engagementScore: 1,
            user: { $arrayElemAt: ["$user", 0] },
          },
        },
      ]);

      return sendSuccessFeedback(res, "Most engaged testimonies retrieved", {
        testimonies,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetTestimoniesWithHighestLikes = async (
    req: Request<never, never, never, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { limit = 10 } = req.query as any;

      const testimonies = await TestimonyModel.aggregate([
        {
          $lookup: {
            from: "testimonylikes",
            localField: "_id",
            foreignField: "testimonyId",
            as: "likes",
          },
        },
        {
          $addFields: {
            likesCount: { $size: "$likes" },
          },
        },
        { $sort: { likesCount: -1 } },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $project: {
            content: 1,
            createdAt: 1,
            likesCount: 1,
            user: { $arrayElemAt: ["$user", 0] },
          },
        },
      ]);

      return sendSuccessFeedback(res, "Most liked testimonies retrieved", {
        testimonies,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetTestimoniesWithHighestReplies = async (
    req: Request<never, never, never, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { limit = 10 } = req.query as any;

      const testimonies = await TestimonyModel.aggregate([
        {
          $lookup: {
            from: "testimonyreplies",
            localField: "_id",
            foreignField: "testimonyId",
            as: "replies",
          },
        },
        {
          $addFields: {
            repliesCount: { $size: "$replies" },
          },
        },
        { $sort: { repliesCount: -1 } },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $project: {
            content: 1,
            createdAt: 1,
            repliesCount: 1,
            user: { $arrayElemAt: ["$user", 0] },
          },
        },
      ]);

      return sendSuccessFeedback(res, "Most replied testimonies retrieved", {
        testimonies,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetTestimoniesWithHighestViews = async (
    req: Request<never, never, never, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { limit = 10 } = req.query as any;

      const testimonies = await TestimonyModel.aggregate([
        {
          $lookup: {
            from: "testimonyviews",
            localField: "_id",
            foreignField: "testimonyId",
            as: "views",
          },
        },
        {
          $addFields: {
            viewsCount: { $size: "$views" },
          },
        },
        { $sort: { viewsCount: -1 } },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $project: {
            content: 1,
            createdAt: 1,
            viewsCount: 1,
            user: { $arrayElemAt: ["$user", 0] },
          },
        },
      ]);

      return sendSuccessFeedback(res, "Most viewed testimonies retrieved", {
        testimonies,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetMostActiveUsers = async (
    req: Request<never, never, never, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { limit = 10 } = req.query as any;

      const users = await TestimonyModel.aggregate([
        {
          $group: {
            _id: "$userId",
            testimonyCount: { $sum: 1 },
            lastActivity: { $max: "$createdAt" },
          },
        },
        { $sort: { testimonyCount: -1 } },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $project: {
            testimonyCount: 1,
            lastActivity: 1,
            user: { $arrayElemAt: ["$user", 0] },
          },
        },
      ]);

      return sendSuccessFeedback(res, "Most active users retrieved", { users });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetMostEngagedUsers = async (
    req: Request<never, never, never, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { limit = 10 } = req.query as any;

      // Get users with highest engagement (likes + replies received on their testimonies)
      const users = await TestimonyModel.aggregate([
        {
          $lookup: {
            from: "testimonylikes",
            localField: "_id",
            foreignField: "testimonyId",
            as: "likes",
          },
        },
        {
          $lookup: {
            from: "testimonyreplies",
            localField: "_id",
            foreignField: "testimonyId",
            as: "replies",
          },
        },
        {
          $addFields: {
            totalLikes: { $size: "$likes" },
            totalReplies: { $size: "$replies" },
          },
        },
        {
          $group: {
            _id: "$userId",
            totalLikes: { $sum: "$totalLikes" },
            totalReplies: { $sum: "$totalReplies" },
            engagementScore: {
              $sum: { $add: ["$totalLikes", "$totalReplies"] },
            },
          },
        },
        { $sort: { engagementScore: -1 } },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $project: {
            totalLikes: 1,
            totalReplies: 1,
            engagementScore: 1,
            user: { $arrayElemAt: ["$user", 0] },
          },
        },
      ]);

      return sendSuccessFeedback(res, "Most engaged users retrieved", {
        users,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetMostLikedUsers = async (
    req: Request<never, never, never, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { limit = 10 } = req.query as any;

      const users = await TestimonyModel.aggregate([
        {
          $lookup: {
            from: "testimonylikes",
            localField: "_id",
            foreignField: "testimonyId",
            as: "likes",
          },
        },
        {
          $addFields: {
            likesCount: { $size: "$likes" },
          },
        },
        {
          $group: {
            _id: "$userId",
            totalLikes: { $sum: "$likesCount" },
          },
        },
        { $sort: { totalLikes: -1 } },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $project: {
            totalLikes: 1,
            user: { $arrayElemAt: ["$user", 0] },
          },
        },
      ]);

      return sendSuccessFeedback(res, "Most liked users retrieved", { users });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetMostViewedUsers = async (
    req: Request<never, never, never, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { limit = 10 } = req.query as any;

      const users = await TestimonyModel.aggregate([
        {
          $lookup: {
            from: "testimonyviews",
            localField: "_id",
            foreignField: "testimonyId",
            as: "views",
          },
        },
        {
          $addFields: {
            viewsCount: { $size: "$views" },
          },
        },
        {
          $group: {
            _id: "$userId",
            totalViews: { $sum: "$viewsCount" },
          },
        },
        { $sort: { totalViews: -1 } },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $project: {
            totalViews: 1,
            user: { $arrayElemAt: ["$user", 0] },
          },
        },
      ]);

      return sendSuccessFeedback(res, "Most viewed users retrieved", { users });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const FlagTestimony = async (
    req: Request<IdParams, never, TestimonyFlagRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const adminDetails = await getAdminUserDetails(req as any);
      const { id } = req.params;
      const { reason } = req.body;

      const testimony = await TestimonyModel.findById(id);
      if (!testimony) {
        return sendErrorFeedback(res, 404, "Testimony not found");
      }

      await TestimonyModel.findByIdAndUpdate(id, {
        isFlagged: true,
        flagReason: reason || "Flagged by admin",
        flaggedBy: adminDetails._id,
      });

      return sendSuccessFeedback(res, "Testimony flagged successfully");
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const UnflagTestimony = async (
    req: Request<IdParams, never, TestimonyUnflagRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const testimony = await TestimonyModel.findById(id);
      if (!testimony) {
        return sendErrorFeedback(res, 404, "Testimony not found");
      }

      await TestimonyModel.findByIdAndUpdate(id, {
        isFlagged: false,
        flagReason: undefined,
        flaggedBy: undefined,
      });

      return sendSuccessFeedback(res, "Testimony unflagged successfully");
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetFlaggedTestimonies = async (
    req: Request<never, never, never, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const paginationOptions = getPaginationOptions(req as any);

      const testimonies = await TestimonyModel.paginate(
        { isFlagged: true },
        {
          ...paginationOptions,
          sort: { createdAt: -1 },
          populate: ["userDetails"],
        },
      );

      return sendSuccessFeedback(res, "Flagged testimonies retrieved", {
        testimonies,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetAllTestimonies = async (
    req: Request<never, never, never, TestimonyFilterQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { isFlagged, userId } = req.query as any;

      // Build filter
      const filter: any = {};
      if (isFlagged !== undefined) filter.isFlagged = isFlagged === "true";
      if (userId) filter.userId = userId;

      const paginationOptions = getPaginationOptions(req as any);

      const testimonies = await TestimonyModel.paginate(filter, {
        ...paginationOptions,
        sort: { createdAt: -1 },
        populate: ["userDetails"],
      });

      return sendSuccessFeedback(res, "Testimonies retrieved", {
        testimonies,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };
  return {
    GetTestimonyDetails,
    GetTestimonyWithHighestEngagement,
    GetTestimoniesWithHighestLikes,
    GetTestimoniesWithHighestReplies,
    GetTestimoniesWithHighestViews,
    GetMostActiveUsers,
    GetMostEngagedUsers,
    GetMostLikedUsers,
    GetMostViewedUsers,
    FlagTestimony,
    UnflagTestimony,
    GetFlaggedTestimonies,
    GetAllTestimonies,
  };
};
