import { Document, PaginateModel, Schema, Types, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface ITeamPermission extends Document {
  name: string;
  description: string;
  createdBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  updatedBy?: Types.ObjectId;
}

const teamPermissionSchema = new Schema<ITeamPermission>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, required: true },
    updatedBy: { type: Schema.Types.ObjectId },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

teamPermissionSchema.plugin(mongoosePaginate);

teamPermissionSchema.virtual("createdByDetails", {
  ref: "admin",
  localField: "createdBy",
  foreignField: "_id",
  justOne: true,
});

teamPermissionSchema.virtual("updatedByDetails", {
  ref: "admin",
  localField: "updatedBy",
  foreignField: "_id",
  justOne: true,
});

const TeamPermissionModel = model<
  ITeamPermission,
  PaginateModel<ITeamPermission>
>("permission", teamPermissionSchema);

export default TeamPermissionModel;
