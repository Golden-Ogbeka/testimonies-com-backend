import { Document, PaginateModel, Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { IBaseUser } from "./user.model";

export interface IOrganization extends IBaseUser {
  businessName: string;
  businessEmail: string;
  businessPhoneNumber: string;
  businessLogoURL?: string;
  businessAddress: string;
  businessLocationGeographicCoordinates?: [number, number];
  businessWebsite?: string;
  businessBio?: string;
  accountType: "organization";
}

const organizationSchema = new Schema<IOrganization>(
  {
    username: { type: String, required: true, unique: true },
    businessName: { type: String, required: true },
    businessEmail: { type: String, required: true, unique: true },
    businessPhoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verificationCode: { type: String, required: false, default: "" },
    businessLogoURL: { type: String, required: false, default: "" },
    coverImageURL: { type: String, required: false, default: "" },
    businessAddress: { type: String, required: true },
    businessLocationGeographicCoordinates: {
      type: [Number],
      required: false,
    },
    businessWebsite: { type: String, default: "" },
    active: { type: Boolean, default: true },
    emailIsVerified: { type: Boolean, default: false },
    phoneNumberIsVerified: { type: Boolean, default: false },
    ntfToken: { type: String, default: "" },
    smsPinId: { type: String, default: "" },
    isFlagged: { type: Boolean, default: false },
    kycCompleted: { type: Boolean, default: false },
    subscriptionType: {
      type: String,
      default: "basic",
      enum: ["basic", "premium"],
    },
    businessBio: { type: String, required: false, default: "" },
    triedLogin: { type: Boolean, default: false },
    triedPasswordReset: { type: Boolean, default: false },
    lastLoginAttempt: { type: Date, required: false },
    lastSuccessfulLogin: { type: Date, required: false },
    accountType: { type: String, default: "organization", immutable: true },
    triedSignup: { type: Boolean, default: false },
    profileVisibility: {
      type: String,
      enum: ["public", "private", "secret"],
      default: "public",
    },
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

organizationSchema.index({
  username: "text",
  businessName: "text",
});

// Added Optimization Indexes
organizationSchema.index({ active: 1, accountType: 1 });
organizationSchema.index({ subscriptionType: 1, active: 1 });

// Hide Password in responses
organizationSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.verificationCode;
  delete obj.smsPinId;
  return obj;
};

organizationSchema.plugin(mongoosePaginate);

const OrganizationModel = model<IOrganization, PaginateModel<IOrganization>>(
  "organization",
  organizationSchema,
);

export default OrganizationModel;
