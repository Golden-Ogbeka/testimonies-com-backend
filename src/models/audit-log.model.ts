import { Document, PaginateModel, Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface IAuditLog extends Document {
  adminId?: string;
  userId?: string;
  action: string;
  userType?: "admin" | "user" | "organization";
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  level: "info" | "warning" | "error" | "critical";
  category: "auth" | "user" | "testimony" | "system" | "data" | "security";
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    adminId: { type: String, ref: "Admin" },
    userId: { type: String, ref: "User" },
    action: { type: String, required: true },
    userType: {
      type: String,
      enum: ["admin", "user", "organization"],
      default: "user",
    },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
    level: {
      type: String,
      enum: ["info", "warning", "error", "critical"],
      default: "info",
    },
    category: {
      type: String,
      enum: ["auth", "user", "testimony", "system", "data", "security"],
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for admin details
auditLogSchema.virtual("adminDetails", {
  ref: "admin",
  localField: "adminId",
  foreignField: "_id",
  select: "firstName lastName email role",
  justOne: true,
});

// Virtual for user details
auditLogSchema.virtual("userDetails", {
  refPath: "userType",
  localField: "userId",
  foreignField: "_id",
  options: {
    select:
      "username firstName lastName email businessLogoURL profileImage businessName accountType",
  },
  justOne: true,
});

auditLogSchema.plugin(mongoosePaginate);

const AuditLogModel = model<IAuditLog, PaginateModel<IAuditLog>>(
  "audit-log",
  auditLogSchema,
);

export default AuditLogModel;
