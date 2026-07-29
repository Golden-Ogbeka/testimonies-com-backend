import { Document, PaginateModel, Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface ITestimonyLike extends Document {
  testimonyId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  userType: "user" | "organization";
  createdAt: Date;
  updatedAt: Date;
}

const testimonyLikeSchema = new Schema<ITestimonyLike>(
  {
    testimonyId: { type: Schema.Types.ObjectId, required: true },
    userId: { type: Schema.Types.ObjectId, required: true },
    userType: {
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

testimonyLikeSchema.index({ testimonyId: 1, userId: 1 }, { unique: true });

// Virtuals
testimonyLikeSchema.virtual("testimonyDetails", {
  ref: "testimony",
  localField: "testimonyId",
  foreignField: "_id",
  justOne: true,
});

testimonyLikeSchema.virtual("userDetails", {
  refPath: "userType",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
  select:
    "-triedLogin -kycCompleted -profileVisibility -ntfToken -isFlagged -lastLoginAttempt -lastSuccessfulLogin -triedPasswordReset -triedSignup -active -phoneNumberIsVerified",
});

testimonyLikeSchema.plugin(mongoosePaginate);

const TestimonyLikeModel = model<ITestimonyLike, PaginateModel<ITestimonyLike>>(
  "testimony-like",
  testimonyLikeSchema,
);

export default TestimonyLikeModel;
