import { Document, PaginateModel, Schema, Types, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface IPromotionRequest extends Document {
  user: Types.ObjectId;
  userType: "user" | "organization";
  title: string;
  description: string;
  targetAudience: "all" | "premium" | "basic" | "organizations";
  startDate: Date;
  endDate?: Date;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const promotionRequestSchema = new Schema<IPromotionRequest>(
  {
    user: { type: Schema.Types.ObjectId, required: true },
    userType: {
      type: String,
      enum: ["user", "organization"],
      default: "organization",
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    targetAudience: {
      type: String,
      enum: ["all", "premium", "basic", "organizations"],
      default: "all",
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

promotionRequestSchema.virtual("userDetails", {
  refPath: "userType",
  localField: "user",
  foreignField: "_id",
  justOne: true,
});

promotionRequestSchema.plugin(mongoosePaginate);

const PromotionRequestModel = model<
  IPromotionRequest,
  PaginateModel<IPromotionRequest>
>("promotion-request", promotionRequestSchema);

export default PromotionRequestModel;
