import { Document, Schema, model } from "mongoose";

export interface IJobResult extends Document {
  token: string;
  type: "google_oauth" | "payment_init";
  status: "pending" | "processing" | "completed" | "failed";
  resultData?: Record<string, unknown>;
  errorData?: { message: string; code?: string };
  userId?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const jobResultSchema = new Schema<IJobResult>(
  {
    token: { type: String, required: true, unique: true, index: true },
    type: {
      type: String,
      enum: ["google_oauth", "payment_init"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    resultData: { type: Schema.Types.Mixed },
    errorData: {
      message: { type: String },
      code: { type: String },
    },
    userId: { type: String },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true },
);

const JobResultModel = model<IJobResult>("job-result", jobResultSchema);

export default JobResultModel;
