import { Document, PaginateModel, Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface IOrganization extends Document {
  username: string;
  businessName: string;
  businessEmail: string;
  businessPhoneNumber: string;
  password: string;
  verificationCode?: string;
  businessLogoURL?: string;
  coverImageURL?: string;
  businessAddress: string;
  businessLocationGeographicCoordinates?: [number, number];
  businessWebsite?: string;
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
  businessBio?: string;
  triedLogin: boolean;
  triedPasswordReset: boolean;
  lastLoginAttempt?: Date; // Date of last failed login attempt
  lastSuccessfulLogin?: Date; // Date of last successful login
  accountType: "organization";
  triedSignup?: boolean; // Boolean to track if user has tried to signup
  profileVisibility: "public" | "private" | "secret";
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
  let obj = this.toObject();
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
