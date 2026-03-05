import { Document, PaginateModel, Schema, Types, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface ISubscriptionPlan extends Document {
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: "monthly" | "yearly" | "quarterly";
  features: string[];
  isActive: boolean;
  trialDays?: number;
  maxUsers?: number;
  maxTestimonies?: number;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}

const subscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, required: true, default: "NGN" },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly", "quarterly"],
      required: true,
    },
    features: [{ type: String }],
    isActive: { type: Boolean, default: true },
    trialDays: { type: Number },
    maxUsers: { type: Number },
    maxTestimonies: { type: Number },
    createdBy: { type: Schema.Types.ObjectId },
    updatedBy: { type: Schema.Types.ObjectId },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

subscriptionPlanSchema.plugin(mongoosePaginate);

// Virtuals
subscriptionPlanSchema.virtual("createdByDetails", {
  ref: "admin",
  localField: "createdBy",
  foreignField: "_id",
  justOne: true,
});

subscriptionPlanSchema.virtual("updatedByDetails", {
  ref: "admin",
  localField: "updatedBy",
  foreignField: "_id",
  justOne: true,
});

const SubscriptionPlanModel = model<
  ISubscriptionPlan,
  PaginateModel<ISubscriptionPlan>
>("subscription-plan", subscriptionPlanSchema);

export default SubscriptionPlanModel;
