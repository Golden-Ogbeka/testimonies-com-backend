import { Document, PaginateModel, Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface IUser extends Document {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password?: string;
  verificationCode?: string;
  coverImageURL?: string;
  profileImage?: string;
  address?: string;
  active: boolean;
  emailIsVerified: boolean;
  phoneNumberIsVerified: boolean;
  ntfToken?: string;
  smsPinId?: string;
  isFlagged: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  subscriptionType: "basic" | "premium";
  kycCompleted: boolean;
  bio?: string;
  triedLogin: boolean;
  triedPasswordReset: boolean;
  lastLoginAttempt?: Date; // Date of last failed login attempt
  lastSuccessfulLogin?: Date; // Date of last successful login
  accountType: "user";
  triedSignup?: boolean; // Boolean to track if user has tried to signup
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verificationCode: String,
    coverImageURL: String,
    profileImage: String,
    address: String,
    bio: String,
    active: { type: Boolean, default: true },
    emailIsVerified: { type: Boolean, default: false },
    phoneNumberIsVerified: { type: Boolean, default: false },
    ntfToken: String,
    smsPinId: String,
    isFlagged: { type: Boolean, default: false },
    subscriptionType: {
      type: String,
      enum: ["basic", "premium"],
      default: "basic",
    },
    kycCompleted: { type: Boolean, default: false },
    triedLogin: { type: Boolean, default: false },
    triedPasswordReset: { type: Boolean, default: false },
    lastLoginAttempt: Date,
    lastSuccessfulLogin: Date,
    accountType: { type: String, default: "user", immutable: true },
    triedSignup: { type: Boolean, default: false },
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.index({
  username: "text",
});

// Hide Password in responses
userSchema.methods.toJSON = function () {
  let obj = this.toObject();
  delete obj.password;
  delete obj.verificationCode;
  delete obj.smsPinId;

  return obj;
};

userSchema.plugin(mongoosePaginate);

const UserModel = model<IUser, PaginateModel<IUser>>("user", userSchema);

export default UserModel;
