import { Document, PaginateModel, Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface ITestimonyReplyLike extends Document {
  replyId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  testimonyId: Schema.Types.ObjectId;
  userType: "user" | "organization";

  createdAt: Date;
  updatedAt: Date;
}

const testimonyReplyLikeSchema = new Schema<ITestimonyReplyLike>(
  {
    replyId: { type: Schema.Types.ObjectId, required: true },
    userId: { type: Schema.Types.ObjectId, required: true },
    testimonyId: { type: Schema.Types.ObjectId, required: true },
    userType: { type: String, enum: ["user", "organization"], required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

testimonyReplyLikeSchema.index({ replyId: 1, userId: 1 }, { unique: true });

// Virtuals
testimonyReplyLikeSchema.virtual("replyDetails", {
  ref: "testimony-reply",
  localField: "replyId",
  foreignField: "_id",
  justOne: true,
});

testimonyReplyLikeSchema.virtual("testimonyDetails", {
  ref: "testimony",
  localField: "testimonyId",
  foreignField: "_id",
  justOne: true,
});

testimonyReplyLikeSchema.virtual("userDetails", {
  refPath: "userType",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

testimonyReplyLikeSchema.plugin(mongoosePaginate);

const TestimonyReplyLikeModel = model<
  ITestimonyReplyLike,
  PaginateModel<ITestimonyReplyLike>
>("testimony-reply-like", testimonyReplyLikeSchema);

export default TestimonyReplyLikeModel;
