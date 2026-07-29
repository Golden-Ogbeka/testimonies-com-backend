import { Document, PaginateModel, Schema, Types, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface ITeamMember extends Document {
  user: Types.ObjectId;
  organization: Types.ObjectId;
  role: Types.ObjectId;
  status: "active" | "inactive";
  addedBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const teamMemberSchema = new Schema<ITeamMember>(
  {
    user: { type: Schema.Types.ObjectId, ref: "user", required: true },
    organization: {
      type: Schema.Types.ObjectId,
      ref: "organization",
      required: true,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: "team-permission",
      required: true,
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "organization",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

teamMemberSchema.plugin(mongoosePaginate);

teamMemberSchema.virtual("userDetails", {
  ref: "user",
  localField: "user",
  foreignField: "_id",
  justOne: true,
  select:
    "-triedLogin -kycCompleted -profileVisibility -ntfToken -isFlagged -lastLoginAttempt -lastSuccessfulLogin -triedPasswordReset -triedSignup -active -phoneNumberIsVerified",
});

teamMemberSchema.virtual("organizationDetails", {
  ref: "organization",
  localField: "organization",
  foreignField: "_id",
  justOne: true,
  select:
    "-triedLogin -kycCompleted -profileVisibility -ntfToken -isFlagged -lastLoginAttempt -lastSuccessfulLogin -triedPasswordReset -triedSignup -active -phoneNumberIsVerified",
});

teamMemberSchema.virtual("roleDetails", {
  ref: "team-permission",
  localField: "role",
  foreignField: "_id",
  justOne: true,
});

const TeamMemberModel = model<ITeamMember, PaginateModel<ITeamMember>>(
  "team-member",
  teamMemberSchema,
);

export default TeamMemberModel;
