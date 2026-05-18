import bcryptjs from "bcryptjs";
import { Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
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
  AuthUserRequest,
  CreateTestimonyRequestBody,
  CustomPaginateResult,
  CustomRequest,
  ReplyToTestimonyRequestBody,
  UpdateTestimonyRequestBody,
} from "../../../../types";
import { getPaginationOptions } from "../../../../utils/pagination";

export const UserTestimonyController = () => {
  const GetPublicTestimonies = async (req: CustomRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const options = getPaginationOptions(req);

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
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetPublicTestimony = async (req: CustomRequest, res: Response) => {
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
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetTestimonies = async (
    req: CustomRequest<
      never,
      any,
      never,
      {
        tag?: string;
        keyword?: string;
        type?: "broadcast" | "normal";
        userId?: string;
        page?: string;
        limit?: string;
      }
    >,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return sendValidationErrorFeedback(res, errors);
      }

      const currentUser = await getUserDetails(req);

      const options = getPaginationOptions(req);

      const page = options.page ?? 1;
      const limit = options.limit ?? 20;

      const { offset } = paginate({
        page,
        limit,
      });

      const { tag, keyword, type, userId } = req.query;

      const matchQuery: Record<string, any> = {
        isDeleted: false,
        isSecret: false,
      };

      const andConditions: Record<string, any>[] = [];

      // FILTER BY USER
      if (userId) {
        matchQuery.userId = new ObjectId(userId);
      }

      // FILTER BY TAG
      if (tag) {
        matchQuery.tags = tag.toLowerCase();
      }

      // FILTER BY TYPE
      if (type === "broadcast") {
        matchQuery.isBroadcast = true;
        matchQuery.broadcastApproved = true;
      }

      if (type === "normal") {
        matchQuery.isBroadcast = false;
      }

      // DEFAULT FILTER
      if (!type) {
        andConditions.push({
          $or: [
            { isBroadcast: false },
            {
              isBroadcast: true,
              broadcastApproved: true,
            },
          ],
        });
      }

      // KEYWORD SEARCH
      if (keyword) {
        andConditions.push({
          $or: [
            {
              title: {
                $regex: keyword,
                $options: "i",
              },
            },
            {
              description: {
                $regex: keyword,
                $options: "i",
              },
            },
          ],
        });
      }

      if (andConditions.length > 0) {
        matchQuery.$and = andConditions;
      }

      const basePipeline = [
        {
          $match: matchQuery,
        },

        // BLOCKED USERS
        {
          $lookup: {
            from: "user-blocks",
            let: {
              testimonyUserId: "$userId",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$userToBlockId", "$$testimonyUserId"],
                      },
                      {
                        $eq: ["$userBlockingId", currentUser._id],
                      },
                    ],
                  },
                },
              },
            ],
            as: "blocked",
          },
        },

        // FOLLOW STATUS
        {
          $lookup: {
            from: "follow-requests",
            let: {
              testimonyUserId: "$userId",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$leaderId", "$$testimonyUserId"],
                      },
                      {
                        $eq: ["$followerId", currentUser._id],
                      },
                      {
                        $eq: ["$status", "accepted"],
                      },
                    ],
                  },
                },
              },
            ],
            as: "followed",
          },
        },

        // USER DETAILS
        {
          $lookup: {
            from: "users",
            let: {
              testimonyUserId: "$userId",
              testimonyUserType: "$userType",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$$testimonyUserType", "user"],
                      },
                      {
                        $eq: ["$_id", "$$testimonyUserId"],
                      },
                    ],
                  },
                },
              },
              {
                $project: {
                  firstName: 1,
                  lastName: 1,
                  username: 1,
                  profileImage: 1,
                  accountType: 1,
                  profileVisibility: 1,
                },
              },
            ],
            as: "user",
          },
        },

        // ORGANIZATION DETAILS
        {
          $lookup: {
            from: "organizations",
            let: {
              testimonyUserId: "$userId",
              testimonyUserType: "$userType",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$$testimonyUserType", "organization"],
                      },
                      {
                        $eq: ["$_id", "$$testimonyUserId"],
                      },
                    ],
                  },
                },
              },
              {
                $project: {
                  businessName: 1,
                  businessLogoURL: 1,
                  accountType: 1,
                  profileVisibility: 1,
                },
              },
            ],
            as: "org",
          },
        },

        // COMPUTED FIELDS
        {
          $addFields: {
            isBlocked: {
              $gt: [{ $size: "$blocked" }, 0],
            },

            isFollowed: {
              $gt: [{ $size: "$followed" }, 0],
            },

            userDetails: {
              $cond: {
                if: {
                  $eq: ["$userType", "user"],
                },
                then: {
                  $arrayElemAt: ["$user", 0],
                },
                else: {
                  $arrayElemAt: ["$org", 0],
                },
              },
            },

            visibility: {
              $ifNull: [
                {
                  $arrayElemAt: ["$user.profileVisibility", 0],
                },
                {
                  $arrayElemAt: ["$org.profileVisibility", 0],
                },
              ],
            },
          },
        },

        // VISIBILITY FILTERING
        {
          $match: {
            isBlocked: false,

            visibility: {
              $ne: "secret",
            },

            $or: [
              {
                visibility: "public",
              },

              {
                $and: [
                  {
                    visibility: "private",
                  },
                  {
                    isFollowed: true,
                  },
                ],
              },

              {
                userId: currentUser._id,
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
              // LIKED STATUS
              {
                $lookup: {
                  from: "testimony-likes",
                  let: {
                    testimonyId: "$_id",
                  },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            {
                              $eq: ["$testimonyId", "$$testimonyId"],
                            },
                            {
                              $eq: ["$userId", currentUser._id],
                            },
                          ],
                        },
                      },
                    },
                  ],
                  as: "liked",
                },
              },

              {
                $addFields: {
                  isLiked: {
                    $gt: [{ $size: "$liked" }, 0],
                  },
                },
              },

              // SORTING
              {
                $sort: {
                  isFollowed: -1,
                  createdAt: -1,
                },
              },

              // PAGINATION
              {
                $skip: offset,
              },

              {
                $limit: limit,
              },

              // CLEANUP
              {
                $project: {
                  blocked: 0,
                  followed: 0,
                  liked: 0,
                  user: 0,
                  org: 0,
                  isBlocked: 0,
                  visibility: 0,
                  isDeleted: 0,
                  isSecret: 0,
                  deletedAt: 0,
                },
              },
            ],

            total: [
              {
                $count: "total",
              },
            ],
          },
        },
      ]);

      const testimonies = result?.results ?? [];

      const totalCount = result?.total?.[0]?.total ?? 0;

      const totalPages = Math.ceil(totalCount / limit);

      const hasNextPage = offset + limit < totalCount;

      const hasPrevPage = page > 1;

      return sendSuccessFeedback(res, "Testimonies retrieved", {
        testimonies: {
          results: testimonies,
          totalResults: totalCount,
          resultsPerPage: limit,
          currentPage: page,
          totalPages,

          nextPage: hasNextPage ? page + 1 : null,

          prevPage: hasPrevPage ? page - 1 : null,

          hasNextPage,
          hasPrevPage,
        },
      });
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetTestimony = async (
    req: CustomRequest<
      {
        id: string;
      },
      any
    >,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req);

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
      })
        .select("-isDeleted -isSecret -deletedAt -deletedBy")
        .populate("userDetails");

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
        userId: userDetails._id,
      }).lean();

      if (!alreadyViewed) {
        await TestimonyViewModel.create({
          testimonyId: testimony._id,
          userId: userDetails._id,
          userType: userDetails.accountType,
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
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const CreateTestimony = async (
    req: AuthUserRequest<never, any, CreateTestimonyRequestBody>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req);

      const {
        title,
        description,
        tags,
        isBroadcast,
        broadcastOrganizationId,
        isSecret,
      } = req.body;

      const files = req.files as Express.Multer.File[] | undefined;
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
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const UpdateTestimony = async (
    req: AuthUserRequest<
      {
        id: string;
      },
      any,
      UpdateTestimonyRequestBody
    >,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req);

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
        testimony.broadcastOrganizationId = new Types.ObjectId(
          broadcastOrganizationId,
        ) as any;
      }
      testimony.isSecret =
        isSecret !== undefined ? isSecret : testimony.isSecret;
      testimony.isEdited = true;

      await testimony.save();

      return sendSuccessFeedback(res, "Testimony updated successfully", {
        testimony,
      });
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const DeleteTestimony = async (
    req: AuthUserRequest<{
      id: string;
    }>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req);

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
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const ReplyToTestimony = async (
    req: AuthUserRequest<
      {
        id: string;
      },
      any,
      ReplyToTestimonyRequestBody
    >,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req);

      const { id } = req.params;
      const { content } = req.body;

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
        content: content,
        likesCount: 0,
        userType: userDetails.accountType,
      });

      // Update testimony replies count
      testimony.repliesCount = (testimony.repliesCount || 0) + 1;
      await testimony.save();

      return sendSuccessFeedback(res, "Reply created successfully", {
        reply,
      });
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const UpdateReply = async (
    req: AuthUserRequest<
      {
        id: string;
      },
      any,
      ReplyToTestimonyRequestBody
    >,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req);

      const { id } = req.params;
      const { content } = req.body;

      const reply = await TestimonyReplyModel.findOne({
        _id: id,
        userId: userDetails._id,
        isDeleted: false,
      });

      if (!reply) {
        return sendErrorFeedback(res, 404, "Reply not found");
      }

      reply.content = content || reply.content;
      reply.isEdited = true;
      await reply.save();

      return sendSuccessFeedback(res, "Reply updated successfully", {
        reply,
      });
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const DeleteReply = async (
    req: AuthUserRequest<{
      id: string;
    }>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req);
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
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const LikeTestimony = async (
    req: CustomRequest<{
      id: string;
    }>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req);

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

  const UnlikeTestimony = async (
    req: AuthUserRequest<{ id: string }>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req);
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
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetTestimonyLikes = async (
    req: AuthUserRequest<
      {
        id: string;
      },
      any,
      any,
      {
        page?: string;
        limit?: string;
      }
    >,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;
      const userDetails = await getUserDetails(req);

      const testimony = await TestimonyModel.findOne({
        _id: id,
        isDeleted: false,
        $or: [{ isSecret: false }, { userId: userDetails._id }],
      });

      if (!testimony) {
        return sendErrorFeedback(res, 404, "Testimony not found");
      }

      const options = getPaginationOptions(req);

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
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const CheckTestimonyLiked = async (
    req: AuthUserRequest<{
      id: string;
    }>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req);

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
    } catch (error: unknown) {
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
    req: AuthUserRequest<
      {
        id: string;
      },
      any,
      any,
      {
        page?: string;
        limit?: string;
      }
    >,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const options = getPaginationOptions(req);
      const userDetails = await getUserDetails(req);

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
        replyId: { $in: result.results.map((reply: any) => reply._id) },
      });

      result.results = result.results.map((reply: any) => {
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
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetReply = async (
    req: AuthUserRequest<{
      id: string;
    }>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req);
      const { id } = req.params;

      const reply = await TestimonyReplyModel.findOne({
        _id: id,
        isDeleted: false,
      }).populate(["userDetails", "testimonyDetails"]);

      if (!reply) {
        return sendErrorFeedback(res, 404, "Reply not found");
      }

      // Check if user liked the reply
      const isLiked = await TestimonyReplyLikeModel.findOne({
        replyId: reply._id,
        userId: userDetails._id,
      });

      return sendSuccessFeedback(res, "Reply retrieved", {
        reply: {
          ...reply.toObject(),
          isLiked: !!isLiked,
        },
      });
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const LikeReply = async (
    req: CustomRequest<{
      id: string;
    }>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req);

      const { id } = req.params;

      const reply = await TestimonyReplyModel.findOne({
        _id: id,
        isDeleted: false,
      });

      if (!reply) {
        return sendErrorFeedback(res, 404, "Reply not found");
      }

      // Check if user already liked the reply
      const existingLike = await TestimonyReplyLikeModel.findOne({
        replyId: reply._id,
        userId: userDetails._id,
        testimonyId: reply.testimonyId,
      });

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
    req: CustomRequest<{
      id: string;
    }>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req);

      const { id } = req.params;

      const reply = await TestimonyReplyModel.findOne({
        _id: id,
        isDeleted: false,
      });

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
    req: AuthUserRequest<{
      id: string;
    }>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req);

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
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetReplyLikes = async (
    req: AuthUserRequest<
      {
        id: string;
      },
      any,
      any,
      {
        page?: string;
        limit?: string;
      }
    >,
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

      const options = getPaginationOptions(req);

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
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetMyTestimonies = async (
    req: AuthUserRequest<
      never,
      any,
      any,
      {
        page?: string;
        limit?: string;
      }
    >,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return sendValidationErrorFeedback(res, errors);
      }

      const currentUser = await getUserDetails(req);

      const options = getPaginationOptions(req);

      const page = options.page ?? 1;
      const limit = options.limit ?? 20;

      const { offset } = paginate({
        page,
        limit,
      });

      const [result] = await TestimonyModel.aggregate([
        {
          $match: {
            userId: currentUser._id,
            isDeleted: false,
          },
        },

        // USER DETAILS
        {
          $lookup: {
            from: "users",
            let: {
              testimonyUserId: "$userId",
              testimonyUserType: "$userType",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$$testimonyUserType", "user"],
                      },
                      {
                        $eq: ["$_id", "$$testimonyUserId"],
                      },
                    ],
                  },
                },
              },
              {
                $project: {
                  firstName: 1,
                  lastName: 1,
                  username: 1,
                  profileImage: 1,
                  accountType: 1,
                },
              },
            ],
            as: "user",
          },
        },

        // ORGANIZATION DETAILS
        {
          $lookup: {
            from: "organizations",
            let: {
              testimonyUserId: "$userId",
              testimonyUserType: "$userType",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$$testimonyUserType", "organization"],
                      },
                      {
                        $eq: ["$_id", "$$testimonyUserId"],
                      },
                    ],
                  },
                },
              },
              {
                $project: {
                  businessName: 1,
                  businessLogoURL: 1,
                  accountType: 1,
                },
              },
            ],
            as: "org",
          },
        },

        // LIKED STATUS
        {
          $lookup: {
            from: "testimony-likes",
            let: {
              testimonyId: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$testimonyId", "$$testimonyId"],
                      },
                      {
                        $eq: ["$userId", currentUser._id],
                      },
                    ],
                  },
                },
              },
            ],
            as: "liked",
          },
        },

        // COMPUTED FIELDS
        {
          $addFields: {
            isLiked: {
              $gt: [{ $size: "$liked" }, 0],
            },

            userDetails: {
              $cond: {
                if: {
                  $eq: ["$userType", "user"],
                },
                then: {
                  $arrayElemAt: ["$user", 0],
                },
                else: {
                  $arrayElemAt: ["$org", 0],
                },
              },
            },
          },
        },

        {
          $facet: {
            results: [
              {
                $sort: {
                  createdAt: -1,
                },
              },

              {
                $skip: offset,
              },

              {
                $limit: limit,
              },

              {
                $project: {
                  liked: 0,
                  user: 0,
                  org: 0,
                  isDeleted: 0,
                  deletedAt: 0,
                  deletedBy: 0,
                },
              },
            ],

            total: [
              {
                $count: "total",
              },
            ],
          },
        },
      ]);

      const testimonies = result?.results ?? [];

      const totalCount = result?.total?.[0]?.total ?? 0;

      const totalPages = Math.ceil(totalCount / limit);

      const hasNextPage = offset + limit < totalCount;

      const hasPrevPage = page > 1;

      return sendSuccessFeedback(res, "My testimonies retrieved", {
        testimonies: {
          results: testimonies,
          totalResults: totalCount,
          resultsPerPage: limit,
          currentPage: page,
          totalPages,

          nextPage: hasNextPage ? page + 1 : null,

          prevPage: hasPrevPage ? page - 1 : null,

          hasNextPage,
          hasPrevPage,
        },
      });
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetMyReplies = async (
    req: AuthUserRequest<
      never,
      any,
      any,
      {
        page?: string;
        limit?: string;
      }
    >,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req);
      const options = getPaginationOptions(req);

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
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const DeleteAllTestimonies = async (
    req: CustomRequest<
      ParamsDictionary,
      any,
      {
        password: string;
      }
    >,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req);
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
    req: CustomRequest<
      ParamsDictionary,
      any,
      {
        password: string;
      }
    >,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req);
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
    req: CustomRequest<never, any, never, { limit?: string }>,
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
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetTrendingTestimonies = async (req: CustomRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const options = getPaginationOptions(req);

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
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetUserReplies = async (
    req: CustomRequest<
      { userId: string },
      any,
      any,
      { page?: string; limit?: string }
    >,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { userId } = req.params;
      const options = getPaginationOptions(req);

      const result = (await TestimonyReplyModel.paginate(
        {
          userId,
          isDeleted: false,
        },
        {
          ...options,
          select: "-isDeleted -deletedAt -deletedBy",
          populate: ["testimonyDetails"],
          sort: { createdAt: -1 },
        },
      )) as unknown as CustomPaginateResult<any>;

      return sendSuccessFeedback(res, "User replies retrieved", {
        replies: result,
      });
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetUserTestimonyStats = async (req: CustomRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req);

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
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetBroadcastRequests = async (
    req: AuthUserRequest<
      never,
      any,
      any,
      {
        page?: string;
        limit?: string;
      }
    >,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req);
      const options = getPaginationOptions(req);

      const result = (await TestimonyModel.paginate(
        {
          isDeleted: false,
          isBroadcast: true,
          broadcastApproved: false,
          broadcastOrganizationId: userDetails._id,
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
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetBroadcastRequest = async (
    req: AuthUserRequest<{ id: string }>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req);
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
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const ApproveBroadcastRequest = async (
    req: AuthUserRequest<{
      id: string;
    }>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req);
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
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };
  const RejectBroadcastRequest = async (
    req: AuthUserRequest<{
      id: string;
    }>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req);
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
    } catch (error: unknown) {
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
