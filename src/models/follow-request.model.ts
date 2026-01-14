import { Document, PaginateModel, Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface IFollowRequest extends Document {
  leaderId: Schema.Types.ObjectId;
  followerId: Schema.Types.ObjectId;
  status: "pending" | "accepted" | "rejected";
  createdAt?: Date;
  updatedAt?: Date;
  leaderType: "user" | "organization";
  followerType: "user" | "organization";
}

const followRequestSchema = new Schema<IFollowRequest>(
  {
    leaderId: { type: Schema.Types.ObjectId, required: true },
    followerId: { type: Schema.Types.ObjectId, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    leaderType: {
      type: String,
      required: true,
      enum: ["user", "organization"],
    },
    followerType: {
      type: String,
      required: true,
      enum: ["user", "organization"],
    },
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

followRequestSchema.plugin(mongoosePaginate);

// Virtuals
followRequestSchema.virtual("leaderDetails", {
  refPath: "leaderType",
  localField: "leaderId",
  foreignField: "_id",
  options: {
    select:
      "username firstName lastName email businessLogoURL profileImage businessName accountType",
  },
  justOne: true,
});

followRequestSchema.virtual("followerDetails", {
  refPath: "followerType",
  localField: "followerId",
  foreignField: "_id",
  justOne: true,
  options: {
    select:
      "username firstName lastName email businessLogoURL profileImage businessName accountType",
  },
});

const FollowRequestModel = model<IFollowRequest, PaginateModel<IFollowRequest>>(
  "follow-request",
  followRequestSchema,
);

export default FollowRequestModel;
