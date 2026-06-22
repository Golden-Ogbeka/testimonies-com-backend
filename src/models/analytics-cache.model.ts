import { Document, Schema, model } from "mongoose";

export interface IAnalyticsCache extends Document {
  type: "admin_dashboard" | "user_stats";
  userId?: string;
  overview: {
    totalUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    flaggedUsers: number;
    totalTestimonies: number;
    totalOrganizations: number;
    totalLikes: number;
    totalReplies: number;
    totalViews: number;
  };
  highestEngagement: Record<string, unknown>[];
  highestLikes: Record<string, unknown>[];
  highestReplies: Record<string, unknown>[];
  highestViews: Record<string, unknown>[];
  mostActiveUsers: Record<string, unknown>[];
  mostEngagedUsers: Record<string, unknown>[];
  mostLikedUsers: Record<string, unknown>[];
  mostViewedUsers: Record<string, unknown>[];
  testimonyTags: string[];
  userStats: {
    testimoniesCount: number;
    repliesCount: number;
    likesReceivedCount: number;
    viewsReceivedCount: number;
    likesGivenCount: number;
    viewsGivenCount: number;
  };
  updatedAt: Date;
}

const analyticsCacheSchema = new Schema<IAnalyticsCache>(
  {
    type: {
      type: String,
      enum: ["admin_dashboard", "user_stats"],
      required: true,
    },
    userId: { type: String },
    overview: {
      totalUsers: { type: Number, default: 0 },
      activeUsers: { type: Number, default: 0 },
      verifiedUsers: { type: Number, default: 0 },
      flaggedUsers: { type: Number, default: 0 },
      totalTestimonies: { type: Number, default: 0 },
      totalOrganizations: { type: Number, default: 0 },
      totalLikes: { type: Number, default: 0 },
      totalReplies: { type: Number, default: 0 },
      totalViews: { type: Number, default: 0 },
    },
    highestEngagement: { type: Schema.Types.Mixed, default: [] },
    highestLikes: { type: Schema.Types.Mixed, default: [] },
    highestReplies: { type: Schema.Types.Mixed, default: [] },
    highestViews: { type: Schema.Types.Mixed, default: [] },
    mostActiveUsers: { type: Schema.Types.Mixed, default: [] },
    mostEngagedUsers: { type: Schema.Types.Mixed, default: [] },
    mostLikedUsers: { type: Schema.Types.Mixed, default: [] },
    mostViewedUsers: { type: Schema.Types.Mixed, default: [] },
    testimonyTags: { type: [String], default: [] },
    userStats: {
      testimoniesCount: { type: Number, default: 0 },
      repliesCount: { type: Number, default: 0 },
      likesReceivedCount: { type: Number, default: 0 },
      viewsReceivedCount: { type: Number, default: 0 },
      likesGivenCount: { type: Number, default: 0 },
      viewsGivenCount: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  },
);

const AnalyticsCacheModel = model<IAnalyticsCache>(
  "analytics-cache",
  analyticsCacheSchema,
);

export default AnalyticsCacheModel;
