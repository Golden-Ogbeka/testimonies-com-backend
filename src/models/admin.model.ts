import { Document, PaginateModel, Schema, Types, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface IAdmin extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role: "super-admin" | "admin";
  permissions: string[];
  active: boolean;
  emailIsVerified: boolean;
  lastLoginAttempt?: Date;
  lastSuccessfulLogin?: Date;
  verificationCode?: string;
  profileImage?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}

const adminSchema = new Schema<IAdmin>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String },
    role: {
      type: String,
      enum: ["super-admin", "admin"],
      default: "admin",
    },
    permissions: [{ type: String }],
    active: { type: Boolean, default: true },
    emailIsVerified: { type: Boolean, default: false },
    lastLoginAttempt: { type: Date },
    lastSuccessfulLogin: { type: Date },
    verificationCode: { type: String },
    profileImage: { type: String },

    createdBy: { type: Schema.Types.ObjectId, required: true },
    updatedBy: { type: Schema.Types.ObjectId },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Hide Password in responses
adminSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.verificationCode;
  return obj;
};

// Virtuals
adminSchema.virtual("createdByDetails", {
  ref: "admin",
  localField: "createdBy",
  foreignField: "_id",
  justOne: true,
});

adminSchema.virtual("updatedByDetails", {
  ref: "admin",
  localField: "updatedBy",
  foreignField: "_id",
  justOne: true,
});
adminSchema.plugin(mongoosePaginate);

const AdminModel = model<IAdmin, PaginateModel<IAdmin>>("admin", adminSchema);

export default AdminModel;
