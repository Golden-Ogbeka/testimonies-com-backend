import { Document, PaginateModel, Schema, Types, model, models } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface IPermission extends Document {
  name: string;
  description: string;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const permissionSchema = new Schema<IPermission>(
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

permissionSchema.plugin(mongoosePaginate);

permissionSchema.virtual("createdByDetails", {
  ref: "admin",
  localField: "createdBy",
  foreignField: "_id",
  justOne: true,
});

permissionSchema.virtual("updatedByDetails", {
  ref: "admin",
  localField: "updatedBy",
  foreignField: "_id",
  justOne: true,
});

const PermissionModel =
  (models.permission as PaginateModel<IPermission>) ||
  model<IPermission, PaginateModel<IPermission>>("permission", permissionSchema);

export default PermissionModel;
