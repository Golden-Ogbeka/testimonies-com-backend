import { Document, PaginateModel, Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface IUserBlock extends Document {
  userToBlockId: Schema.Types.ObjectId;
  userBlockingId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  userToBlockType: "user" | "organization";
  userBlockingType: "user" | "organization";
}

const userBlockSchema = new Schema<IUserBlock>(
  {
    userToBlockId: { type: Schema.Types.ObjectId, required: true },
    userBlockingId: { type: Schema.Types.ObjectId, required: true },
    userToBlockType: {
      type: String,
      enum: ["user", "organization"],
      required: true,
    },
    userBlockingType: {
      type: String,
      enum: ["user", "organization"],
      required: true,
    },
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userBlockSchema.plugin(mongoosePaginate);

// Virtuals
userBlockSchema.virtual("userToBlockDetails", {
  refPath: "userToBlockType",
  localField: "userToBlockId",
  foreignField: "_id",
  options: {
    select:
      "username firstName lastName email businessLogoURL profileImage businessName accountType",
  },
  justOne: true,
});

userBlockSchema.virtual("userBlockingDetails", {
  refPath: "userBlockingType",
  localField: "userBlockingId",
  foreignField: "_id",
  justOne: true,
  options: {
    select:
      "username firstName lastName email businessLogoURL profileImage businessName accountType",
  },
});

const UserBlockModel = model<IUserBlock, PaginateModel<IUserBlock>>(
  "user-block",
  userBlockSchema,
);

export default UserBlockModel;
