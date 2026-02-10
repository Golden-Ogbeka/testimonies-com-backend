import { Document, Schema, model } from "mongoose";

export interface ISystemContent extends Document {
  type: "privacy_policy" | "terms_of_service" | "community_guidelines";
  title: string;
  content: string;
  version: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const systemContentSchema = new Schema<ISystemContent>(
  {
    type: {
      type: String,
      enum: ["privacy_policy", "terms_of_service", "community_guidelines"],
      required: true,
      unique: true,
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    version: { type: String, required: true, default: "1.0" },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const SystemContentModel = model<ISystemContent>(
  "system-content",
  systemContentSchema,
);

export default SystemContentModel;
