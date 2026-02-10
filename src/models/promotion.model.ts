import { Document, PaginateModel, Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface IPromotion extends Document {
  title: string;
  description: string;
  type: "discount" | "offer" | "announcement" | "feature";
  targetAudience: "all" | "premium" | "basic" | "organizations";
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  isFlagged: boolean;
  flagReason?: string;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const promotionSchema = new Schema<IPromotion>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ["discount", "offer", "announcement", "feature"],
      required: true,
    },
    targetAudience: {
      type: String,
      enum: ["all", "premium", "basic", "organizations"],
      default: "all",
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
    isFlagged: { type: Boolean, default: false },
    flagReason: { type: String },
    createdBy: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for admin who created the promotion
promotionSchema.virtual("createdBy", {
  ref: "admin",
  localField: "createdBy",
  foreignField: "_id",
  select: "firstName lastName email",
  justOne: true,
});

promotionSchema.plugin(mongoosePaginate);

const PromotionModel = model<IPromotion, PaginateModel<IPromotion>>(
  "promotion",
  promotionSchema,
);

export default PromotionModel;
