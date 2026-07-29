import { Document, PaginateModel, Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface ITestimonyView extends Document {
  testimonyId: Schema.Types.ObjectId;
  userId?: Schema.Types.ObjectId;
  userType: "user" | "organization";

  createdAt: Date;
  updatedAt: Date;
}

const testimonyViewSchema = new Schema<ITestimonyView>(
  {
    testimonyId: { type: Schema.Types.ObjectId, required: true },
    userId: { type: Schema.Types.ObjectId },
    userType: { type: String, enum: ["user", "organization"], required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtuals
testimonyViewSchema.virtual("testimonyDetails", {
  ref: "testimony",
  localField: "testimonyId",
  foreignField: "_id",
  justOne: true,
});

testimonyViewSchema.virtual("userDetails", {
  refPath: "userType",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

testimonyViewSchema.index({ testimonyId: 1, userId: 1 });

testimonyViewSchema.plugin(mongoosePaginate);

const TestimonyViewModel = model<ITestimonyView, PaginateModel<ITestimonyView>>(
  "testimony-view",
  testimonyViewSchema,
);

export default TestimonyViewModel;
