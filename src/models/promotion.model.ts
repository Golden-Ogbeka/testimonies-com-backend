import { Document, PaginateModel, Schema, Types, model } from "mongoose";
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
  flaggedBy: Types.ObjectId;
  flagReason?: string;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
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
    createdBy: { type: Schema.Types.ObjectId, required: true },
    updatedBy: { type: Schema.Types.ObjectId, required: false },
    flaggedBy: { type: Schema.Types.ObjectId },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

promotionSchema.index({ title: 1, description: 1 });


// Virtual for admin who created the promotion
promotionSchema.virtual("createdByDetails", {
  ref: "admin",
  localField: "createdBy",
  foreignField: "_id",
  select: "firstName lastName email",
  justOne: true,
});

// Virtual for admin who updated the promotion
promotionSchema.virtual("updatedByDetails", {
  ref: "admin",
  localField: "updatedBy",
  foreignField: "_id",
  select: "firstName lastName email",
  justOne: true,
});

// Virtual for admin who flagged the promotion
promotionSchema.virtual("flaggedByDetails", {
  ref: "admin",
  localField: "flaggedBy",
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
