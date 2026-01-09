import { PaginateModel, Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface IAuthSession {
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
  // location info
  ipAddress?: string;
  city?: string;
  region?: string;
  country?: string;
  userAgent?: string;
  latitude?: number;
  longitude?: number;
  // device info
  deviceType?: string;
  deviceOS?: string;
  deviceOSVersion?: string;
  deviceModel?: string;
  deviceManufacturer?: string;
}

const authSessionSchema = new Schema<IAuthSession>(
  {
    userId: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    ipAddress: String,
    city: String,
    region: String,
    country: String,
    userAgent: String,
    latitude: Number,
    longitude: Number,
    deviceType: String,
    deviceOS: String,
    deviceOSVersion: String,
    deviceModel: String,
    deviceManufacturer: String,
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Hide Password in responses
authSessionSchema.methods.toJSON = function () {
  let obj = this.toObject();
  delete obj.token;

  return obj;
};

authSessionSchema.plugin(mongoosePaginate);

const AuthSessionModel = model<IAuthSession, PaginateModel<IAuthSession>>(
  "auth-session",
  authSessionSchema,
);

export default AuthSessionModel;
