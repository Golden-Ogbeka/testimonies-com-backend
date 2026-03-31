import { Document, PaginateModel, Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { IOrganization } from "./organization.model";
import { IUser } from "./user.model";

export interface ITestimony extends Document {
  title: string;
  description: string;
  userId: Schema.Types.ObjectId;
  likesCount: number;
  viewsCount: number;
  repliesCount: number;
  tags: string[];
  isBroadcast: boolean;
  broadcastOrganizationId?: Schema.Types.ObjectId; // if isBroadcast is true, this field will be required
  broadcastApproved: boolean;
  isDeleted: boolean;
  isEdited: boolean;
  isFlagged?: boolean;
  flagReason?: string;
  flaggedBy?: Schema.Types.ObjectId;
  deletedAt?: Date;
  mediaURLs?: string[];
  isSecret?: boolean;
  userType: "user" | "organization";
  deletedBy?: "user" | "broadcast-organization";

  createdAt: Date;
  updatedAt: Date;

  // Virtuals
  userDetails?: IUser | IOrganization;
  broadcastUserDetails?: IOrganization;
}

const testimonySchema = new Schema<ITestimony>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, required: true },
    likesCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    repliesCount: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    isBroadcast: { type: Boolean, default: false },
    broadcastOrganizationId: { type: Schema.Types.ObjectId },
    broadcastApproved: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
    deletedAt: Date,
    mediaURLs: { type: [String], default: [] },
    isSecret: { type: Boolean, default: false },
    userType: { type: String, enum: ["user", "organization"], required: true },
    deletedBy: {
      type: String,
      enum: ["user", "broadcast-organization"],
      default: "user",
    },
    flagReason: String,
    isFlagged: Boolean,
    flaggedBy: { type: Schema.Types.ObjectId },
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

testimonySchema.index({
  title: "text",
  description: "text",
  tags: "text",
});

testimonySchema.index({
  isDeleted: 1,
  isSecret: 1,
  isBroadcast: 1,
  broadcastApproved: 1,
});
testimonySchema.index({ userId: 1 });
testimonySchema.index({ createdAt: -1 });

testimonySchema.virtual("userDetails", {
  refPath: "userType",
  localField: "userId",
  foreignField: "_id",
  options: {
    select:
      "username firstName lastName email businessLogoURL profileImage businessName accountType",
  },
  justOne: true,
});

// Virtuals for broadcast user details
testimonySchema.virtual("broadcastOrganizationDetails", {
  ref: "organization",
  localField: "broadcastOrganizationId",
  foreignField: "_id",
  justOne: true,
});

// flagged by details
testimonySchema.virtual("flaggedByDetails", {
  ref: "admin",
  localField: "flaggedBy",
  foreignField: "_id",
  justOne: true,
});

testimonySchema.methods.toJSON = function () {
  const obj = this.toObject();
  // delete obj.isFlagged;
  // delete obj.flagReason;
  // delete obj.deletedBy;
  // delete obj.flaggedBy;

  return obj;
};
testimonySchema.plugin(mongoosePaginate);

const TestimonyModel = model<ITestimony, PaginateModel<ITestimony>>(
  "testimony",
  testimonySchema,
);

export default TestimonyModel;
