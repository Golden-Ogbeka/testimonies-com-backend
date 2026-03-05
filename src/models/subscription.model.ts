import { Document, PaginateModel, Schema, Types, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { ISubscriptionPlan } from "./subscription-plan.model";

export interface ISubscription extends Document {
  userId: string;
  planId: string;
  status: "active" | "cancelled" | "expired" | "trial" | "pending";
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentGateway?: "stripe" | "paystack" | "flutterwave";
  paymentReference?: string;
  trialEndDate?: Date;
  cancelledAt?: Date;
  createdAt?: Date;
  userType: "user" | "organization";
  updatedAt?: Date;
  updatedBy?: Types.ObjectId;
  planDetails?: ISubscriptionPlan;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: String, required: true, unique: true },
    planId: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired", "trial", "pending"],
      default: "trial",
    },
    userType: {
      type: String,
      enum: ["user", "organization"],
      default: "user",
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    autoRenew: { type: Boolean, default: true },
    paymentGateway: {
      type: String,
      enum: ["stripe", "paystack", "flutterwave"],
    },
    paymentReference: { type: String },
    trialEndDate: { type: Date },
    cancelledAt: { type: Date },
    updatedBy: { type: Schema.Types.ObjectId },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Added Optimization Indexes
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ planId: 1, status: 1 });

subscriptionSchema.virtual("userDetails", {
  refPath: "userType",
  localField: "userId",
  foreignField: "_id",
  options: {
    select:
      "username firstName lastName email businessLogoURL profileImage businessName accountType",
  },
  justOne: true,
});

// Virtual for plan details
subscriptionSchema.virtual("planDetails", {
  ref: "subscription-plan",
  localField: "planId",
  foreignField: "_id",
  justOne: true,
});

// Virtual for updated by details
subscriptionSchema.virtual("updatedByDetails", {
  ref: "admin",
  localField: "updatedBy",
  foreignField: "_id",
  justOne: true,
});

subscriptionSchema.plugin(mongoosePaginate);

const SubscriptionModel = model<ISubscription, PaginateModel<ISubscription>>(
  "subscription",
  subscriptionSchema,
);

export default SubscriptionModel;
