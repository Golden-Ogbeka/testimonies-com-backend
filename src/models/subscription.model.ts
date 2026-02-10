import { Document, PaginateModel, Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface ISubscription extends Document {
  userId: string;
  planId: string;
  status: "active" | "cancelled" | "expired" | "trial";
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  trialEndDate?: Date;
  cancelledAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: String, required: true, ref: "User" },
    planId: { type: String, required: true, ref: "SubscriptionPlan" },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired", "trial"],
      default: "trial",
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    autoRenew: { type: Boolean, default: true },
    trialEndDate: { type: Date },
    cancelledAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for user details
subscriptionSchema.virtual("userDetails", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  select: "firstName lastName username email profileImage",
  justOne: true,
});

// Virtual for plan details
subscriptionSchema.virtual("planDetails", {
  ref: "SubscriptionPlan",
  localField: "planId",
  foreignField: "_id",
  justOne: true,
});

subscriptionSchema.plugin(mongoosePaginate);

const SubscriptionModel = model<ISubscription, PaginateModel<ISubscription>>(
  "subscription",
  subscriptionSchema,
);

export default SubscriptionModel;
