import bcryptjs from "bcryptjs";
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { ObjectId } from "mongodb";
import { Types } from "mongoose";
import { getUserDetails } from "../../../../functions/auth";
import {
  sendCatchFeedback,
  sendErrorFeedback,
  sendSuccessFeedback,
  sendValidationErrorFeedback,
} from "../../../../functions/feedback";
import { paginate } from "../../../../functions/pagination";
import OrganizationModel from "../../../../models/organization.model";
import TestimonyLikeModel from "../../../../models/testimony-like.model";
import TestimonyReplyLikeModel from "../../../../models/testimony-reply-like.model";
import TestimonyReplyModel from "../../../../models/testimony-reply.model";
import TestimonyViewModel from "../../../../models/testimony-view.model";
import TestimonyModel, { ITestimony } from "../../../../models/testimony.model";
import {
  CustomPaginateResult,
  getPaginationOptions,
} from "../../../../utils/pagination";

export const UserTestimonyController = () => {
  const GetPublicTestimonies = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const options = getPaginationOptions(req as any);

      const result = (await TestimonyModel.paginate(
        {
          isDeleted: false,
          isSecret: false,
          $or: [
            { isBroadcast: false },
            { isBroadcast: true, broadcastApproved: true },
          ],
        },
        {
          ...options,
          select: "-isDeleted -deletedAt -deletedBy -isSecret",
          populate: [
            {
              path: "userDetails",
              select: "username profileImage",
            },
            {
              path: "broadcastOrganizationDetails",
              select: "username profileImage",
            },
          ],
          sort: { createdAt: -1 },
        },
      )) as unknown as CustomPaginateResult<ITestimony>;

      return sendSuccessFeedback(res, "Public testimonies retrieved", {
        testimonies: result,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetPublicTestimony = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const testimony = await TestimonyModel.findOne({
        _id: id,
        isDeleted: false,
        isSecret: false,
        $or: [
          { isBroadcast: false },
          { isBroadcast: true, broadcastApproved: true },
        ],
      })
        .select("-isDeleted -deletedAt -deletedBy -isSecret")
        .populate([
          {
            path: "userDetails",
            select: "username profileImage",
          },
          {
            path: "broadcastOrganizationDetails",
            select: "username profileImage",
          },
        ]);

      if (!testimony) {
        return sendErrorFeedback(res, 404, "Testimony not found");
      }

      return sendSuccessFeedback(res, "Testimony retrieved", { testimony });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetTestimonies = async (
    req: Request<
      never,
      never,
      never,
      {
        tag?: string;
        keyword?: string;
        type?: "broadcast" | "normal";
        userId?: string;
      }
    >,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendValidationErrorFeedback(res, errors);
      }

      const userDetails = await getUserDetails(req as any);
      const options = getPaginationOptions(req as any);
      const { offset } = paginate({
        page: options.page,
        limit: options.limit,
      });

      const { tag, keyword, type, userId } = req.query;

      const matchQuery: Record<string, any> = {
        isDeleted: false,
        isSecret: false,
      };

      if (userId) {
        matchQuery.userId = new ObjectId(userId);
      }

      if (tag) {
        matchQuery.tags = tag.toLowerCase();
      }

      if (type === "broadcast") {
        matchQuery.isBroadcast = true;
        matchQuery.broadcastApproved = true;
      }

      if (type === "normal") {
        matchQuery.isBroadcast = false;
      }

      if (!type) {
        matchQuery.$or = [
          { isBroadcast: false },
          { isBroadcast: true, broadcastApproved: true },
        ];
      }

      if (keyword) {
        matchQuery.$or = [
          { title: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ];
      }

      const basePipeline = [
        { $match: matchQuery },

        {
          $lookup: {
            from: "user-blocks",
            localField: "userId",
            foreignField: "userToBlockId",
            pipeline: [{ $match: { userBlockingId: userDetails._id } }],
            as: "blocked",
          },
        },

        {
          $lookup: {
            from: "follow-requests",
            localField: "userId",
            foreignField: "leaderId",
            pipeline: [
              {
                $match: {
                  followerId: userDetails._id,
                  status: "accepted",
                },
              },
            ],
            as: "followed",
          },
        },

        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            pipeline: [{ $project: { profileVisibility: 1 } }],
            as: "user",
          },
        },

        {
          $lookup: {
            from: "organizations",
            localField: "userId",
            foreignField: "_id",
            pipeline: [{ $project: { profileVisibility: 1 } }],
            as: "org",
          },
        },

        {
          $addFields: {
            isBlocked: { $gt: [{ $size: "$blocked" }, 0] },
            isFollowed: { $gt: [{ $size: "$followed" }, 0] },
            visibility: {
              $ifNull: [
                { $arrayElemAt: ["$user.profileVisibility", 0] },
                { $arrayElemAt: ["$org.profileVisibility", 0] },
              ],
            },
          },
        },

        {
          $match: {
            $and: [
              { isBlocked: false },
              { visibility: { $ne: "secret" } },
              {
                $or: [
                  { visibility: "public" },
                  {
                    $and: [{ visibility: "private" }, { isFollowed: true }],
                  },
                  { userId: userDetails._id },
                ],
              },
            ],
          },
        },
      ];

      const [result] = await TestimonyModel.aggregate([
        ...basePipeline,
        {
          $facet: {
            results: [
              {
                $lookup: {
                  from: "testimony-likes",
                  localField: "_id",
                  foreignField: "testimonyId",
                  pipeline: [{ $match: { userId: userDetails._id } }],
                  as: "liked",
                },
              },
              {
                $addFields: {
                  isLiked: { $gt: [{ $size: "$liked" }, 0] },
                },
              },
              { $sort: { isFollowed: -1, createdAt: -1 } },
              { $skip: offset },
              { $limit: options.limit },
              {
                $project: {
                  blocked: 0,
                  followed: 0,
                  user: 0,
                  org: 0,
                  liked: 0,
                  isBlocked: 0,
                  visibility: 0,
                  isDeleted: 0,
                  isSecret: 0,
                  deletedAt: 0,
                },
              },
            ],
            total: [{ $count: "total" }],
          },
        },
      ]);

      const testimonies = result?.results ?? [];
      const totalCount = result?.total?.[0]?.total ?? 0;

      const totalPages = Math.ceil(totalCount / options.limit);
      const hasNextPage = offset + options.limit < totalCount;
      const hasPrevPage = options.page > 1;

      return sendSuccessFeedback(res, "Testimonies retrieved", {
        testimonies: {
          results: testimonies,
          totalResults: totalCount,
          resultsPerPage: options.limit,
          currentPage: options.page,
          totalPages,
          nextPage: hasNextPage ? options.page + 1 : null,
          prevPage: hasPrevPage ? options.page - 1 : null,
          hasNextPage,
          hasPrevPage,
        },
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetTestimony = async (
    req: Request<{
      id: string;
    }>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req as any);

      const { id } = req.params;

      const testimony = await TestimonyModel.findOne({
        _id: id,
        isDeleted: false,
        $or: [{ isSecret: false }, { userId: userDetails._id }],
        $and: [
          {
            $or: [
              { isBroadcast: false },
              { isBroadcast: true, broadcastApproved: true },
              { userId: userDetails._id },
            ],
          },
        ],
      }).select("-isDeleted -isSecret -deletedAt -deletedBy");

      if (!testimony) {
        return sendErrorFeedback(res, 404, "Testimony not found");
      }

      // Check if user liked the testimony
      const isLiked = await TestimonyLikeModel.findOne({
        testimonyId: testimony._id,
        userId: userDetails._id,
      });

      // Only authenticated users can view
      // Check if testimony has been viewed already
      const alreadyViewed = await TestimonyViewModel.findOne({
        testimonyId: testimony._id,
        userId: userDetails?._id,
      }).lean();

      if (!alreadyViewed) {
        await TestimonyViewModel.create({
          testimonyId: testimony._id,
          userId: userDetails?._id,
          userType: userDetails?.accountType,
        });
        testimony.viewsCount = (testimony.viewsCount || 0) + 1;
        await testimony.save();
      }

      return sendSuccessFeedback(res, "Testimony retrieved", {
        testimony: {
          ...testimony.toObject(),
          isLiked: !!isLiked,
        },
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const CreateTestimony = async (
    req: Request<
      never,
      never,
      {
        title: string;
        description: string;
        tags?: string[];
        isBroadcast?: boolean;
        broadcastOrganizationId?: string;
        isSecret?: boolean;
      }
    >,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req as any);

      const {
        title,
        description,
        tags,
        isBroadcast,
        broadcastOrganizationId,
        isSecret,
      } = req.body;

      const files = req.files as Express.Multer.File[];
      const uploadedMediaURLs: string[] = [];
      if (files && files.length > 0) {
        for (const file of files) {
          uploadedMediaURLs.push(file.path);
        }
      }
      // Check for broadcast organization
      if (isBroadcast) {
        const broadcastOrganization = await OrganizationModel.findOne({
          _id: broadcastOrganizationId,
          active: true,
          isFlagged: false,
          profileVisibility: "public",
        });

        if (!broadcastOrganization) {
          return sendErrorFeedback(
            res,
            404,
            "Broadcast organization not found or does not allow broadcasts",
          );
        }
      }

      const testimony = await TestimonyModel.create({
        title,
        description,
        userId: userDetails._id,
        tags: tags || [],
        isBroadcast: isBroadcast || false,
        broadcastApproved: false,
        mediaURLs: uploadedMediaURLs,
        ...(isBroadcast && {
          broadcastOrganizationId,
        }),
        isSecret: isSecret || false,
        userType: userDetails.accountType,
      });

      return sendSuccessFeedback(res, "Testimony created successfully", {
        testimony,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const UpdateTestimony = async (
    req: Request<
      {
        id: string;
      },
      never,
      {
        title?: string;
        description?: string;
        tags?: string[];
        isBroadcast?: boolean;
        broadcastOrganizationId?: string;
        isSecret?: boolean;
      }
    >,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req as any);

      const { id } = req.params;
      const {
        title,
        description,
        tags,
        isBroadcast,
        isSecret,
        broadcastOrganizationId,
      } = req.body;

      const testimony = await TestimonyModel.findOne({
        _id: id,
        userId: userDetails._id,
        isDeleted: false,
      });

      if (!testimony) {
        return sendErrorFeedback(res, 404, "Testimony not found");
      }

      testimony.title = title || testimony.title;
      testimony.description = description || testimony.description;
      testimony.tags = tags || testimony.tags;
      testimony.isBroadcast =
        isBroadcast !== undefined ? isBroadcast : testimony.isBroadcast;
      testimony.broadcastApproved = false;

      if (
        broadcastOrganizationId !== undefined &&
        broadcastOrganizationId !== null
      ) {
        typeof broadcastOrganizationId === "string"
          ? new Types.ObjectId(broadcastOrganizationId)
          : broadcastOrganizationId;
      } else {
        testimony.broadcastOrganizationId = testimony.broadcastOrganizationId;
      }
      testimony.isSecret =
        isSecret !== undefined ? isSecret : testimony.isSecret;
      testimony.isEdited = true;

      await testimony.save();

      return sendSuccessFeedback(res, "Testimony updated successfully", {
        testimony,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const DeleteTestimony = async (
    req: Request<{
      id: string;
    }>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req as any);

      const { id } = req.params;

      const testimony = await TestimonyModel.findOne({
        _id: id,
        userId: userDetails._id,
        isDeleted: false,
      });

      if (!testimony) {
        return sendErrorFeedback(res, 404, "Testimony not found");
      }

      testimony.isDeleted = true;
      testimony.deletedAt = new Date();
      await testimony.save();

      return sendSuccessFeedback(res, "Testimony deleted successfully", {
        testimony,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const ReplyToTestimony = async (
    req: Request<
      { id: string },
      never,
      {
        description: string;
      }
    >,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req as any);

      const { id } = req.params;
      const { description } = req.body;

      const testimony = await TestimonyModel.findOne({
        _id: id,
        isDeleted: false,
        $or: [{ isSecret: false }, { userId: userDetails._id }],
      });

      if (!testimony) {
        return sendErrorFeedback(res, 404, "Testimony not found");
      }

      const reply = await TestimonyReplyModel.create({
        testimonyId: testimony._id,
        userId: userDetails._id,
        content: description,
        likesCount: 0,
        userType: userDetails.accountType,
      });

      // Update testimony replies count
      testimony.repliesCount += 1;
      await testimony.save();

      return sendSuccessFeedback(res, "Reply created successfully", {
        reply,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const UpdateReply = async (
    req: Request<
      { id: string },
      never,
      {
        description: string;
      }
    >,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req as any);

      const { id } = req.params;
      const { description } = req.body;

      const reply = await TestimonyReplyModel.findOne({
        _id: id,
        userId: userDetails._id,
        isDeleted: false,
      }).select("-isDeleted -deletedAt -deletedBy");

      if (!reply) {
        return sendErrorFeedback(res, 404, "Reply not found");
      }

      reply.content = description || reply.content;
      reply.isEdited = true;
      await reply.save();

      return sendSuccessFeedback(res, "Reply updated successfully", {
        reply,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const DeleteReply = async (
    req: Request<{
      id: string;
    }>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req as any);

      const { id } = req.params;

      const reply = await TestimonyReplyModel.findOne({
        _id: id,
        userId: userDetails._id,
        isDeleted: false,
      });

      if (!reply) {
        return sendErrorFeedback(res, 404, "Reply not found");
      }

      reply.isDeleted = true;
      reply.deletedAt = new Date();
      await reply.save();

      // Update testimony replies count
      const testimony = await TestimonyModel.findById(reply.testimonyId);
      if (testimony && testimony.repliesCount > 0) {
        testimony.repliesCount -= 1;
        await testimony.save();
      }

      return sendSuccessFeedback(res, "Reply deleted successfully", {
        reply,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const LikeTestimony = async (
    req: Request<{
      id: string;
    }>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req as any);

      const { id } = req.params;

      const testimony = await TestimonyModel.findOne({
        _id: id,
        isDeleted: false,
        $or: [{ isSecret: false }, { userId: userDetails._id }],
      });

      if (!testimony) {
        return sendErrorFeedback(res, 404, "Testimony not found");
      }

      // Check if user already liked the testimony
      const existingLike = await TestimonyLikeModel.findOne({
        testimonyId: testimony._id,
        userId: userDetails._id,
      });

      if (existingLike) {
        return sendErrorFeedback(
          res,
          400,
          "You have already liked this testimony",
        );
      }

      // Create like
      await TestimonyLikeModel.create({
        testimonyId: testimony._id,
        userId: userDetails._id,
        userType: userDetails.accountType,
      });

      // Update testimony likes count
      testimony.likesCount += 1;
      await testimony.save();

      return sendSuccessFeedback(res, "Testimony liked successfully", {
        testimony,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const UnlikeTestimony = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req as any);

      const { id } = req.params;

      const testimony = await TestimonyModel.findOne({
        _id: id,
        isDeleted: false,
        $or: [{ isSecret: false }, { userId: userDetails._id }],
      });

      if (!testimony) {
        return sendErrorFeedback(res, 404, "Testimony not found");
      }

      // Find and delete the like
      const like = await TestimonyLikeModel.findOneAndDelete({
        testimonyId: testimony._id,
        userId: userDetails._id,
      });

      if (!like) {
        return sendErrorFeedback(res, 400, "You have not liked this testimony");
      }

      // Update testimony likes count
      if (testimony.likesCount > 0) {
        testimony.likesCount -= 1;
        await testimony.save();
      }

      return sendSuccessFeedback(res, "Testimony unliked successfully", {
        testimony,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetTestimonyLikes = async (
    req: Request<{
      id: string;
    }>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;
      const userDetails = await getUserDetails(req as any);

      const testimony = await TestimonyModel.findOne({
        _id: id,
        isDeleted: false,
        $or: [{ isSecret: false }, { userId: userDetails._id }],
      });

      if (!testimony) {
        return sendErrorFeedback(res, 404, "Testimony not found");
      }

      const options = getPaginationOptions(req as any);

      const likes = await TestimonyLikeModel.paginate(
        {
          testimonyId: testimony._id,
        },
        {
          ...options,
          populate: ["testimonyDetails", "userDetails"],
        },
      );

      return sendSuccessFeedback(res, "Likes retrieved", {
        likes,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const CheckTestimonyLiked = async (
    req: Request<{
      id: string;
    }>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req as any);

      const { id } = req.params;

      const testimony = await TestimonyModel.findOne({
        _id: id,
        isDeleted: false,
        $or: [{ isSecret: false }, { userId: userDetails._id }],
      });

      if (!testimony) {
        return sendErrorFeedback(res, 404, "Testimony not found");
      }

      const like = await TestimonyLikeModel.findOne({
        testimonyId: testimony._id,
        userId: userDetails._id,
      });

      return sendSuccessFeedback(res, "Like status retrieved", {
        isLiked: !!like,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Retrieves replies for a specific testimony.
   *
   * @param {Request} req - Express request object.
   * @param {Response} res - Express response object.
   *
   * @returns {Promise<Response>} - Promise resolved with Express response object.
   *
   * @throws {Error} - If there is an error while retrieving the replies.
   */
  /*******  e6f11ee0-81a0-47b3-b172-84c1695d256f  *******/
  const GetTestimonyReplies = async (
    req: Request<{
      id: string;
    }>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const options = getPaginationOptions(req as any);
      const userDetails = await getUserDetails(req as any);

      const testimony = await TestimonyModel.findOne({
        _id: id,
        isDeleted: false,
        $or: [{ isSecret: false }, { userId: userDetails._id }],
      });

      if (!testimony) {
        return sendErrorFeedback(res, 404, "Testimony not found");
      }

      const result = (await TestimonyReplyModel.paginate(
        {
          testimonyId: testimony._id,
          isDeleted: false,
        },
        {
          ...options,
          select: "-isDeleted -deletedAt -deletedBy",

          populate: ["userDetails", "testimonyDetails"],
          sort: { createdAt: -1 },
        },
      )) as unknown as CustomPaginateResult<any>;

      const isLiked = await TestimonyReplyLikeModel.find({
        userId: userDetails._id,
        replyId: { $in: result.results.map((reply) => reply._id) },
      });

      result.results = result.results.map((reply) => {
        return {
          ...reply.toObject(),
          isLiked: isLiked.some(
            (like) => like.replyId.toString() === reply._id.toString(),
          ),
        };
      });

      return sendSuccessFeedback(res, "Replies retrieved", {
        replies: result,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetReply = async (
    req: Request<{
      id: string;
    }>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const reply = await TestimonyReplyModel.findOne({
        _id: id,
        isDeleted: false,
      })
        .select("-isDeleted -deletedAt -deletedBy")
        .populate("userDetails")
        .populate("testimonyDetails");

      if (!reply) {
        return sendErrorFeedback(res, 404, "Reply not found");
      }

      return sendSuccessFeedback(res, "Reply retrieved", {
        reply,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const LikeReply = async (
    req: Request<{
      id: string;
    }>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req as any);

      const { id } = req.params;

      const reply = await TestimonyReplyModel.findOne({
        _id: id,
        isDeleted: false,
      }).lean();

      if (!reply) {
        return sendErrorFeedback(res, 404, "Reply not found");
      }

      // Check if user already liked the reply
      const existingLike = await TestimonyReplyLikeModel.findOne({
        replyId: reply._id,
        userId: userDetails._id,
        testimonyId: reply.testimonyId,
      }).lean();

      if (existingLike) {
        return sendErrorFeedback(res, 400, "You have already liked this reply");
      }

      // Create like
      await TestimonyReplyLikeModel.create({
        replyId: reply._id,
        userId: userDetails._id,
        userType: userDetails.accountType,
        testimonyId: reply.testimonyId,
      });

      // Update reply likes count
      reply.likesCount += 1;
      await reply.save();

      return sendSuccessFeedback(res, "Reply liked successfully", {
        reply,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const UnlikeReply = async (
    req: Request<{
      id: string;
    }>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req as any);

      const { id } = req.params;

      const reply = await TestimonyReplyModel.findOne({
        _id: id,
        isDeleted: false,
      }).lean();

      if (!reply) {
        return sendErrorFeedback(res, 404, "Reply not found");
      }

      // Find and delete the like
      const like = await TestimonyReplyLikeModel.findOneAndDelete({
        replyId: reply._id,
        userId: userDetails._id,
      });

      if (!like) {
        return sendErrorFeedback(res, 400, "You have not liked this reply");
      }

      // Update reply likes count
      if (reply.likesCount > 0) {
        reply.likesCount -= 1;
        await reply.save();
      }

      return sendSuccessFeedback(res, "Reply unliked successfully", {
        reply,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const CheckReplyLiked = async (
    req: Request<{
      id: string;
    }>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req as any);

      const { id } = req.params;

      const reply = await TestimonyReplyModel.findOne({
        _id: id,
        isDeleted: false,
      }).lean();

      if (!reply) {
        return sendErrorFeedback(res, 404, "Reply not found");
      }

      const like = await TestimonyReplyLikeModel.findOne({
        replyId: reply._id,
        userId: userDetails._id,
      }).lean();

      return sendSuccessFeedback(res, "Like status retrieved", {
        isLiked: !!like,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetReplyLikes = async (
    req: Request<{
      id: string;
    }>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const reply = await TestimonyReplyModel.findOne({
        _id: id,
        isDeleted: false,
      }).lean();

      if (!reply) {
        return sendErrorFeedback(res, 404, "Reply not found");
      }

      const options = getPaginationOptions(req as any);

      const likes = await TestimonyReplyLikeModel.paginate(
        {
          replyId: reply._id,
        },
        {
          ...options,
          populate: ["replyDetails", "userDetails"],
        },
      );

      return sendSuccessFeedback(res, "Likes retrieved", {
        likes,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetMyTestimonies = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req as any);
      const options = getPaginationOptions(req as any);

      const result = (await TestimonyModel.paginate(
        {
          userId: userDetails._id,
          isDeleted: false,
        },
        {
          ...options,
          select: "-isDeleted -deletedAt -deletedBy",
          sort: { createdAt: -1 },
        },
      )) as unknown as CustomPaginateResult<ITestimony>;

      return sendSuccessFeedback(res, "My testimonies retrieved", {
        testimonies: result,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetMyReplies = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req as any);
      const options = getPaginationOptions(req as any);

      const result = (await TestimonyReplyModel.paginate(
        {
          userId: userDetails._id,
          isDeleted: false,
        },
        {
          ...options,
          select: "-isDeleted -deletedAt -deletedBy",
          populate: ["testimonyDetails"],
          sort: { createdAt: -1 },
        },
      )) as unknown as CustomPaginateResult<any>;

      return sendSuccessFeedback(res, "My replies retrieved", {
        replies: result,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const DeleteAllTestimonies = async (
    req: Request<
      never,
      never,
      {
        password: string;
      }
    >,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req as any);
      const { password } = req.body;

      const passwordMatch = await bcryptjs.compare(
        password,
        userDetails.password as string,
      );

      if (!passwordMatch) {
        return sendErrorFeedback(res, 403, "Incorrect password");
      }

      const result = await TestimonyModel.updateMany(
        {
          userId: userDetails._id,
          isDeleted: false,
        },
        {
          isDeleted: true,
          deletedAt: new Date(),
        },
      );

      return sendSuccessFeedback(res, "All testimonies deleted successfully", {
        deletedCount: result.modifiedCount,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const DeleteAllReplies = async (
    req: Request<
      never,
      never,
      {
        password: string;
      }
    >,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req as any);
      const { password } = req.body;

      const passwordMatch = await bcryptjs.compare(
        password,
        userDetails.password as string,
      );

      if (!passwordMatch) {
        return sendErrorFeedback(res, 403, "Incorrect password");
      }
      const result = await TestimonyReplyModel.updateMany(
        {
          userId: userDetails._id,
          isDeleted: false,
        },
        {
          isDeleted: true,
          deletedAt: new Date(),
        },
      );

      return sendSuccessFeedback(res, "All replies deleted successfully", {
        deletedCount: result.modifiedCount,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetTestimonyTags = async (
    req: Request<never, never, never, { limit?: number }>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { limit } = req.query;

      const result = await TestimonyModel.aggregate([
        {
          $match: {
            isDeleted: false,
            isSecret: false,
          },
        },
        { $unwind: "$tags" },
        {
          $group: {
            _id: "$tags",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: Number(limit ?? 20) },
        { $project: { _id: 1 } },
      ]);

      return sendSuccessFeedback(res, "Testimony tags retrieved", {
        tags: result.map((item) => item._id),
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetTrendingTestimonies = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const options = getPaginationOptions(req as any);

      const result = (await TestimonyModel.paginate(
        {
          isDeleted: false,
          isSecret: false,
          $or: [
            { isBroadcast: false },
            { isBroadcast: true, broadcastApproved: true },
          ],
        },
        {
          ...options,
          select: "-isDeleted -deletedAt -deletedBy -isSecret",
          populate: [
            {
              path: "userDetails",
              select: "username profileImage",
            },
            {
              path: "broadcastOrganizationDetails",
              select: "username profileImage",
            },
          ],
          sort: { likesCount: -1, viewsCount: -1, createdAt: -1 },
        },
      )) as unknown as CustomPaginateResult<ITestimony>;

      return sendSuccessFeedback(res, "Trending testimonies retrieved", {
        testimonies: result,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetUserReplies = async (
    req: Request<{ userId: string }>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { userId } = req.params;
      const options = getPaginationOptions(req as any);

      const result = (await TestimonyReplyModel.paginate(
        {
          userId,
          isDeleted: false,
        },
        {
          ...options,
          select: "-isDeleted -isSecret -deletedAt -deletedBy",
          populate: ["testimonyDetails"],
          sort: { createdAt: -1 },
        },
      )) as unknown as CustomPaginateResult<any>;

      return sendSuccessFeedback(res, "User replies retrieved", {
        replies: result,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetUserTestimonyStats = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req as any);

      const [
        testimoniesCount,
        repliesCount,
        likesReceivedCount,
        viewsReceivedCount,
      ] = await Promise.all([
        TestimonyModel.countDocuments({
          userId: userDetails._id,
          isDeleted: false,
        }),
        TestimonyReplyModel.countDocuments({
          userId: userDetails._id,
          isDeleted: false,
        }),
        TestimonyLikeModel.countDocuments({
          testimonyId: {
            $in: await TestimonyModel.find({
              userId: userDetails._id,
              isDeleted: false,
            }).distinct("_id"),
          },
        }),
        TestimonyModel.aggregate([
          {
            $match: {
              userId: userDetails._id,
              isDeleted: false,
            },
          },
          {
            $group: {
              _id: null,
              totalViews: { $sum: "$viewsCount" },
            },
          },
        ]).then((result) => result[0]?.totalViews || 0),
      ]);

      return sendSuccessFeedback(res, "User testimony statistics retrieved", {
        stats: {
          testimoniesCount,
          repliesCount,
          likesReceivedCount,
          viewsReceivedCount,
        },
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetBroadcastRequests = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req as any);
      const options = getPaginationOptions(req as any);

      const result = (await TestimonyModel.paginate(
        {
          isDeleted: false,
          isBroadcast: true,
          broadcastApproved: false,
          broadcastOrganizationId: userDetails,
        },
        {
          ...options,
          select: "-isDeleted -deletedAt -deletedBy",
          populate: ["userDetails"],
          sort: { createdAt: -1 },
        },
      )) as unknown as CustomPaginateResult<ITestimony>;

      return sendSuccessFeedback(res, "Broadcast requests retrieved", {
        requests: result,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetBroadcastRequest = async (
    req: Request<{ id: string }>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req as any);
      const { id } = req.params;

      const testimony = await TestimonyModel.findOne({
        _id: id,
        isDeleted: false,
        isBroadcast: true,
        broadcastApproved: false,
        broadcastOrganizationId: userDetails._id,
      })
        .select("-isDeleted -deletedAt -deletedBy")
        .populate("userDetails");

      if (!testimony) {
        return sendErrorFeedback(res, 404, "Broadcast request not found");
      }

      return sendSuccessFeedback(res, "Broadcast request retrieved", {
        request: testimony,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const ApproveBroadcastRequest = async (
    req: Request<{
      id: string;
    }>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req as any);
      const { id } = req.params;

      const testimony = await TestimonyModel.findOne({
        _id: id,
        isDeleted: false,
        isBroadcast: true,
        broadcastApproved: false,
        broadcastOrganizationId: userDetails._id,
      });

      if (!testimony) {
        return sendErrorFeedback(res, 404, "Broadcast request not found");
      }

      testimony.broadcastApproved = true;
      await testimony.save();

      return sendSuccessFeedback(
        res,
        "Broadcast request approved successfully",
        {
          testimony,
        },
      );
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };
  const RejectBroadcastRequest = async (
    req: Request<{
      id: string;
    }>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req as any);
      const { id } = req.params;

      const testimony = await TestimonyModel.findOne({
        _id: id,
        isDeleted: false,
        isBroadcast: true,
        broadcastApproved: false,
        broadcastOrganizationId: userDetails._id,
      });

      if (!testimony) {
        return sendErrorFeedback(res, 404, "Broadcast request not found");
      }

      // Remove broadcast status from testimony
      testimony.isDeleted = true;
      testimony.deletedAt = new Date();
      testimony.deletedBy = "broadcast-organization";
      await testimony.save();

      return sendSuccessFeedback(
        res,
        "Broadcast request rejected successfully",
        {
          testimony,
        },
      );
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  return {
    GetPublicTestimonies,
    GetPublicTestimony,
    GetTestimonies,
    GetTestimony,
    CreateTestimony,
    UpdateTestimony,
    DeleteTestimony,
    ReplyToTestimony,
    UpdateReply,
    DeleteReply,
    LikeTestimony,
    UnlikeTestimony,
    GetTestimonyLikes,
    CheckTestimonyLiked,
    GetTestimonyReplies,
    GetReply,
    LikeReply,
    UnlikeReply,
    CheckReplyLiked,
    GetReplyLikes,
    GetMyTestimonies,
    GetMyReplies,
    DeleteAllTestimonies,
    DeleteAllReplies,
    GetTrendingTestimonies,
    GetUserReplies,
    GetUserTestimonyStats,
    GetBroadcastRequests,
    GetBroadcastRequest,
    ApproveBroadcastRequest,
    RejectBroadcastRequest,
    GetTestimonyTags,
  };
};
