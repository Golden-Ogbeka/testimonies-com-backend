import { Response } from "express";
import { validationResult } from "express-validator";
import { getAdminUserDetails } from "../../../../functions/auth";
import {
  sendCatchFeedback,
  sendErrorFeedback,
  sendSuccessFeedback,
  sendValidationErrorFeedback,
} from "../../../../functions/feedback";
import TestimonyModel from "../../../../models/testimony.model";
import { CustomRequest } from "../../../../types/express";
import {
  IdParams,
  PaginationQuery,
  TestimonyFilterQuery,
  TestimonyFlagRequestBody,
  TestimonyUnflagRequestBody,
} from "../../../../types/requests";
import { getPaginationOptions } from "../../../../utils/pagination";

export const AdminTestimonyController = () => {
  const GetTestimonyDetails = async (
    req: CustomRequest<{ id: string }>,
    res: Response,
  ) => {
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
    req: CustomRequest<never, any, any, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { limit = "10" } = req.query;
      const limitInt = parseInt(limit as string, 10);

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
            count: {
              $add: [
                { $size: "$likes" },
                { $size: "$replies" },
                { $size: "$views" },
              ],
            },
          },
        },
        { $sort: { count: -1 } },
        { $limit: limitInt },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
            // select user fields
            pipeline: [
              {
                $project: {
                  firstName: 1,
                  lastName: 1,
                  email: 1,
                  profilePicture: 1,
                },
              },
            ],
          },
        },
        {
          $project: {
            title: 1,
            description: 1,
            createdAt: 1,
            count: 1,
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
    req: CustomRequest<never, any, any, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { limit = "10" } = req.query;
      const limitInt = parseInt(limit as string, 10);

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
            count: { $size: "$likes" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: limitInt },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            // select user fields
            pipeline: [
              {
                $project: {
                  firstName: 1,
                  lastName: 1,
                  email: 1,
                  profilePicture: 1,
                },
              },
            ],
            as: "user",
          },
        },
        {
          $project: {
            title: 1,
            description: 1,
            createdAt: 1,
            count: 1,
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
    req: CustomRequest<never, any, any, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { limit = "10" } = req.query;
      const limitInt = parseInt(limit as string, 10);

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
            count: { $size: "$replies" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: limitInt },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            // select user fields
            pipeline: [
              {
                $project: {
                  firstName: 1,
                  lastName: 1,
                  email: 1,
                  profilePicture: 1,
                },
              },
            ],
            as: "user",
          },
        },
        {
          $project: {
            title: 1,
            description: 1,
            createdAt: 1,
            count: 1,
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
    req: CustomRequest<never, any, any, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { limit = "10" } = req.query;
      const limitInt = parseInt(limit as string, 10);

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
            count: { $size: "$views" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: limitInt },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            // select user fields
            pipeline: [
              {
                $project: {
                  firstName: 1,
                  lastName: 1,
                  email: 1,
                  profilePicture: 1,
                },
              },
            ],
            as: "user",
          },
        },
        {
          $project: {
            title: 1,
            description: 1,
            createdAt: 1,
            count: 1,
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
    req: CustomRequest<never, any, any, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { limit = "10" } = req.query;
      const limitInt = parseInt(limit as string, 10);

      const users = await TestimonyModel.aggregate([
        {
          $group: {
            _id: "$userId",
            count: { $sum: 1 },
            lastActivity: { $max: "$createdAt" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: limitInt },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
            // select user fields
            pipeline: [
              {
                $project: {
                  firstName: 1,
                  lastName: 1,
                  email: 1,
                  profilePicture: 1,
                },
              },
            ],
          },
        },
        {
          $project: {
            count: 1,
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
    req: CustomRequest<never, any, any, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { limit = "10" } = req.query;
      const limitInt = parseInt(limit as string, 10);

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
            count: { $sum: "$count" },
            totalReplies: { $sum: "$totalReplies" },
            totalLikes: {
              $sum: { $add: ["$totalLikes", "$totalReplies"] },
            },
          },
        },
        { $sort: { count: -1 } },
        { $limit: limitInt },
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
            count: 1,
            totalReplies: 1,
            totalLikes: 1,
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
    req: CustomRequest<never, any, any, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { limit = "10" } = req.query;
      const limitInt = parseInt(limit as string, 10);

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
            count: { $size: "$likes" },
          },
        },
        {
          $group: {
            _id: "$userId",
            count: { $sum: "$count" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: limitInt },
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
            count: 1,
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
    req: CustomRequest<never, any, any, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { limit = "10" } = req.query;
      const limitInt = parseInt(limit as string, 10);

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
            count: { $size: "$views" },
          },
        },
        {
          $group: {
            _id: "$userId",
            count: { $sum: "$count" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: limitInt },
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
            count: 1,
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
    req: CustomRequest<IdParams, any, TestimonyFlagRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const adminDetails = await getAdminUserDetails(req);
      const { id } = req.params;
      const { reason } = req.body;

      const testimony = await TestimonyModel.findById(id);
      if (!testimony) {
        return sendErrorFeedback(res, 404, "Testimony not found");
      }

      const updatedTestimony = await TestimonyModel.findByIdAndUpdate(id, {
        isFlagged: true,
        flagReason: reason || "Flagged by admin",
        flaggedBy: adminDetails._id,
      });

      return sendSuccessFeedback(res, "Testimony flagged successfully", {
        updatedTestimony,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const UnflagTestimony = async (
    req: CustomRequest<IdParams, any, TestimonyUnflagRequestBody>,
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
    req: CustomRequest<never, any, any, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const paginationOptions = getPaginationOptions(req);

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
    req: CustomRequest<never, any, any, TestimonyFilterQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { isFlagged, userId } = req.query;

      // Build filter
      const filter: any = {};
      if (isFlagged !== undefined) {
        filter.isFlagged =
          String(isFlagged).toLowerCase() === "true" || isFlagged === true;
      }
      if (userId) filter.userId = userId;

      const paginationOptions = getPaginationOptions(req);

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
