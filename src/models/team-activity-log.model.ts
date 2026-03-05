import { Document, PaginateModel, Schema, Types, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface ITeamActivityLog extends Document {
  teamMember: Types.ObjectId;
  organization: Types.ObjectId;
  action: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const teamActivityLogSchema = new Schema<ITeamActivityLog>(
  {
    teamMember: {
      type: Schema.Types.ObjectId,
      ref: "team-member",
      required: true,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: "organization",
      required: true,
    },
    action: { type: String, required: true },
    description: { type: String, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

teamActivityLogSchema.plugin(mongoosePaginate);

teamActivityLogSchema.virtual("teamMemberDetails", {
  ref: "team-member",
  localField: "teamMember",
  foreignField: "_id",
  justOne: true,
});

const TeamActivityLogModel = model<
  ITeamActivityLog,
  PaginateModel<ITeamActivityLog>
>("team-activity-log", teamActivityLogSchema);

export default TeamActivityLogModel;
