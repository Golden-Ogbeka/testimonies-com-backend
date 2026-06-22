import Agenda from "agenda";
import colors from "colors/safe";
import AnalyticsCacheModel from "../../models/analytics-cache.model";
import OrganizationModel from "../../models/organization.model";
import TestimonyLikeModel from "../../models/testimony-like.model";
import TestimonyReplyModel from "../../models/testimony-reply.model";
import TestimonyViewModel from "../../models/testimony-view.model";
import TestimonyModel from "../../models/testimony.model";
import UserModel from "../../models/user.model";
import { CRON_JOB_NAMES } from "../data";

export const AnalyticsCronDefinitions = (agenda: Agenda) => {
  agenda.define(CRON_JOB_NAMES.COMPUTE_ADMIN_ANALYTICS, async (job, done) => {
    try {
      const [
        totalUsers,
        activeUsers,
        verifiedUsers,
        flaggedUsers,
        totalTestimonies,
        totalOrganizations,
        totalLikes,
        totalReplies,
        totalViews,
      ] = await Promise.all([
        UserModel.countDocuments(),
        UserModel.countDocuments({ active: true }),
        UserModel.countDocuments({ emailIsVerified: true }),
        UserModel.countDocuments({ isFlagged: true }),
        TestimonyModel.countDocuments({ isDeleted: false }),
        OrganizationModel.countDocuments(),
        TestimonyLikeModel.countDocuments(),
        TestimonyReplyModel.countDocuments(),
        TestimonyViewModel.countDocuments(),
      ]);

      const [
        highestEngagement,
        highestLikes,
        highestReplies,
        highestViews,
        mostActiveUsers,
        mostEngagedUsers,
        mostLikedUsers,
        mostViewedUsers,
        testimonyTags,
      ] = await Promise.all([
        TestimonyModel.aggregate([
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
              engagementCount: {
                $add: [
                  { $size: "$likes" },
                  { $size: "$replies" },
                  { $size: "$views" },
                ],
              },
            },
          },
          { $sort: { engagementCount: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "userDetails",
            },
          },
          {
            $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true },
          },
          {
            $project: {
              _id: 1,
              title: 1,
              engagementCount: 1,
              "userDetails.firstName": 1,
              "userDetails.lastName": 1,
              "userDetails.email": 1,
              "userDetails.profileImage": 1,
            },
          },
        ]),
        TestimonyModel.aggregate([
          {
            $lookup: {
              from: "testimonylikes",
              localField: "_id",
              foreignField: "testimonyId",
              as: "likes",
            },
          },
          { $addFields: { count: { $size: "$likes" } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "userDetails",
            },
          },
          {
            $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true },
          },
          {
            $project: {
              _id: 1,
              title: 1,
              count: 1,
              "userDetails.firstName": 1,
              "userDetails.lastName": 1,
              "userDetails.email": 1,
              "userDetails.profileImage": 1,
            },
          },
        ]),
        TestimonyModel.aggregate([
          {
            $lookup: {
              from: "testimonyreplies",
              localField: "_id",
              foreignField: "testimonyId",
              as: "replies",
            },
          },
          { $addFields: { count: { $size: "$replies" } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "userDetails",
            },
          },
          {
            $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true },
          },
          {
            $project: {
              _id: 1,
              title: 1,
              count: 1,
              "userDetails.firstName": 1,
              "userDetails.lastName": 1,
              "userDetails.email": 1,
              "userDetails.profileImage": 1,
            },
          },
        ]),
        TestimonyModel.aggregate([
          {
            $lookup: {
              from: "testimonyviews",
              localField: "_id",
              foreignField: "testimonyId",
              as: "views",
            },
          },
          { $addFields: { count: { $size: "$views" } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "userDetails",
            },
          },
          {
            $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true },
          },
          {
            $project: {
              _id: 1,
              title: 1,
              count: 1,
              "userDetails.firstName": 1,
              "userDetails.lastName": 1,
              "userDetails.email": 1,
              "userDetails.profileImage": 1,
            },
          },
        ]),
        TestimonyModel.aggregate([
          { $group: { _id: "$userId", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "userDetails",
            },
          },
          { $unwind: "$userDetails" },
          {
            $project: {
              _id: 1,
              count: 1,
              "userDetails.firstName": 1,
              "userDetails.lastName": 1,
              "userDetails.email": 1,
              "userDetails.profileImage": 1,
            },
          },
        ]),
        TestimonyModel.aggregate([
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
            $group: {
              _id: "$userId",
              totalLikes: { $sum: { $size: "$likes" } },
              totalReplies: { $sum: { $size: "$replies" } },
            },
          },
          {
            $addFields: {
              totalEngagement: { $add: ["$totalLikes", "$totalReplies"] },
            },
          },
          { $sort: { totalEngagement: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "userDetails",
            },
          },
          { $unwind: "$userDetails" },
          {
            $project: {
              _id: 1,
              totalEngagement: 1,
              "userDetails.firstName": 1,
              "userDetails.lastName": 1,
              "userDetails.email": 1,
              "userDetails.profileImage": 1,
            },
          },
        ]),
        TestimonyLikeModel.aggregate([
          { $group: { _id: "$userId", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "userDetails",
            },
          },
          { $unwind: "$userDetails" },
          {
            $project: {
              _id: 1,
              count: 1,
              "userDetails.firstName": 1,
              "userDetails.lastName": 1,
              "userDetails.email": 1,
              "userDetails.profileImage": 1,
            },
          },
        ]),
        TestimonyViewModel.aggregate([
          { $group: { _id: "$userId", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "userDetails",
            },
          },
          { $unwind: "$userDetails" },
          {
            $project: {
              _id: 1,
              count: 1,
              "userDetails.firstName": 1,
              "userDetails.lastName": 1,
              "userDetails.email": 1,
              "userDetails.profileImage": 1,
            },
          },
        ]),
        TestimonyModel.aggregate([
          { $match: { isDeleted: false, isSecret: false } },
          { $unwind: "$tags" },
          { $group: { _id: "$tags", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 50 },
          { $project: { _id: 1 } },
        ]).then((tags) => tags.map((t) => t._id)),
      ]);

      await AnalyticsCacheModel.findOneAndUpdate(
        { type: "admin_dashboard" },
        {
          type: "admin_dashboard",
          overview: {
            totalUsers,
            activeUsers,
            verifiedUsers,
            flaggedUsers,
            totalTestimonies,
            totalOrganizations,
            totalLikes,
            totalReplies,
            totalViews,
          },
          highestEngagement,
          highestLikes,
          highestReplies,
          highestViews,
          mostActiveUsers,
          mostEngagedUsers,
          mostLikedUsers,
          mostViewedUsers,
          testimonyTags,
          updatedAt: new Date(),
        },
        { upsert: true, new: true },
      );

      done();
    } catch (error) {
      console.log("CRON:", colors.red(JSON.stringify(error)));
    }
  });

  agenda.define(CRON_JOB_NAMES.COMPUTE_USER_STATS, async (job, done) => {
    try {
      const { attrs } = job;
      const data = attrs.data as { userId: string };

      const [
        testimoniesCount,
        repliesCount,
        likesReceivedCount,
        viewsReceivedCount,
        likesGivenCount,
        viewsGivenCount,
      ] = await Promise.all([
        TestimonyModel.countDocuments({
          userId: data.userId,
          isDeleted: false,
        }),
        TestimonyReplyModel.countDocuments({
          userId: data.userId,
          isDeleted: false,
        }),
        TestimonyLikeModel.countDocuments({
          testimonyId: {
            $in: await TestimonyModel.find({
              userId: data.userId,
              isDeleted: false,
            }).distinct("_id"),
          },
        }),
        TestimonyModel.aggregate([
          { $match: { userId: data.userId, isDeleted: false } },
          { $group: { _id: null, totalViews: { $sum: "$viewsCount" } } },
        ]).then((result) => result[0]?.totalViews || 0),
        TestimonyLikeModel.countDocuments({ userId: data.userId }),
        TestimonyViewModel.countDocuments({ userId: data.userId }),
      ]);

      await AnalyticsCacheModel.findOneAndUpdate(
        { type: "user_stats", userId: data.userId },
        {
          type: "user_stats",
          userId: data.userId,
          userStats: {
            testimoniesCount,
            repliesCount,
            likesReceivedCount,
            viewsReceivedCount,
            likesGivenCount,
            viewsGivenCount,
          },
          updatedAt: new Date(),
        },
        { upsert: true, new: true },
      );

      done();
    } catch (error) {
      console.log("CRON:", colors.red(JSON.stringify(error)));
    }
  });
};
