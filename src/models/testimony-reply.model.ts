import { Document, PaginateModel, Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface ITestimonyReply extends Document {
  testimonyId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  content: string;
  likesCount: number;
  isDeleted: boolean;
  isEdited: boolean;
  deletedAt?: Date;
  userType: "user" | "organization";

  createdAt: Date;
  updatedAt: Date;
}

const testimonyReplySchema = new Schema<ITestimonyReply>(
  {
    testimonyId: { type: Schema.Types.ObjectId, required: true },
    userId: { type: Schema.Types.ObjectId, required: true },
    content: { type: String, required: true },
    likesCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
    userType: { type: String, enum: ["user", "organization"], required: true },
    deletedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

testimonyReplySchema.index({
  content: "text",
});
testimonyReplySchema.index({ testimonyId: 1 });
testimonyReplySchema.index({ userId: 1 });

// Virtuals
testimonyReplySchema.virtual("testimonyDetails", {
  ref: "testimony",
  localField: "testimonyId",
  foreignField: "_id",
  justOne: true,
  options: { select: "-deletedAt -isSecret -isDeleted" },
});

testimonyReplySchema.virtual("userDetails", {
  refPath: "userType",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
  select:
    "-triedLogin -kycCompleted -profileVisibility -ntfToken -isFlagged -lastLoginAttempt -lastSuccessfulLogin -triedPasswordReset -triedSignup -active -phoneNumberIsVerified",
});

testimonyReplySchema.plugin(mongoosePaginate);

const TestimonyReplyModel = model<
  ITestimonyReply,
  PaginateModel<ITestimonyReply>
>("testimony-reply", testimonyReplySchema);

export default TestimonyReplyModel;
