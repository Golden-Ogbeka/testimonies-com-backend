import { ParamsDictionary } from "express-serve-static-core";

// Common ID parameter types
export interface IdParams extends ParamsDictionary {
  id: string;
}

export interface TransactionIdParams extends ParamsDictionary {
  transactionId: string;
}

export interface SubscriptionIdParams extends ParamsDictionary {
  subscriptionId: string;
}

export interface UserIdParams extends ParamsDictionary {
  userId: string;
}

export interface AdminIdParams extends ParamsDictionary {
  adminId: string;
}

// Admin Auth Request Types
export interface AdminSigninRequestBody {
  email: string;
  password: string;
}

export interface AdminVerifyOTPRequestBody {
  email: string;
  otp: string;
}

export interface AdminResendOTPRequestBody {
  email: string;
}

export interface AdminResetPasswordRequestBody {
  email: string;
}

export interface AdminResetPasswordUpdateRequestBody {
  otp: string;
  email: string;
  newPassword: string;
}

export interface AdminChangePasswordRequestBody {
  currentPassword: string;
  newPassword: string;
}

export interface AdminCreateRequestBody {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role?: "super-admin" | "admin";
  permissions?: string[];
}

export interface AdminUpdateRequestBody {
  role: "super-admin" | "admin";
}

export interface AdminProfileUpdateRequestBody {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

// Permission Request Types
export interface PermissionCreateRequestBody {
  name: string;
  description: string;
}

export interface PermissionUpdateRequestBody {
  name?: string;
  description?: string;
}

// Role Request Types
export interface RoleCreateRequestBody {
  name: string;
  description: string;
  permissions?: string[];
  level?: number;
}

export interface RoleUpdateRequestBody {
  name?: string;
  description?: string;
  permissions?: string[];
  level?: number;
  isActive?: boolean;
}

export interface AssignPermissionRequestBody {
  roleId: string;
  permissionId: string;
}

// Subscription Plan Request Types
export interface SubscriptionPlanCreateRequestBody {
  name: string;
  description: string;
  price: number;
  currency?: string;
  billingCycle: "monthly" | "yearly" | "quarterly";
  features?: string[];
  trialDays?: number;
  maxUsers?: number;
  maxTestimonies?: number;
}

export interface SubscriptionPlanUpdateRequestBody {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  billingCycle?: "monthly" | "yearly" | "quarterly";
  features?: string[];
  trialDays?: number;
  maxUsers?: number;
  maxTestimonies?: number;
  isActive?: boolean;
}

// Subscription Request Types
export interface RefundTransactionRequestBody {
  reason: string;
  amount?: number;
}

export interface ExtendSubscriptionRequestBody {
  days: number;
}

export interface SubscribeRequestBody {
  planId: string;
  autoRenew?: boolean;
}

export interface PayForSubscriptionRequestBody {
  paymentGateway: "stripe" | "paystack" | "flutterwave";
  subscriptionId: string;
}

export interface VerifyPaymentRequestBody {
  reference: string;
}

// Promotion Request Types
export interface PromotionCreateRequestBody {
  title: string;
  description: string;
  type: "discount" | "offer" | "announcement" | "feature";
  targetAudience?: "all" | "premium" | "basic" | "organizations";
  startDate: string;
  endDate?: string;
}

export interface PromotionUpdateRequestBody {
  title?: string;
  description?: string;
  type?: "discount" | "offer" | "announcement" | "feature";
  targetAudience?: "all" | "premium" | "basic" | "organizations";
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface PromotionFlagRequestBody {
  reason: string;
}

export interface PromotionRequestCreateRequestBody {
  title: string;
  description: string;
  type: "discount" | "offer" | "announcement" | "feature";
  targetAudience?: "all" | "premium" | "basic" | "organizations";
  startDate: string;
  endDate?: string;
}

export interface PromotionRequestActionRequestBody {
  reason?: string;
}

// Testimony Request Types
export interface TestimonyFlagRequestBody {
  reason: string;
}

export interface TestimonyUnflagRequestBody {
  reason?: string;
}

export interface CreateTestimonyRequestBody {
  title: string;
  description: string;
  tags?: string;
  isBroadcast?: boolean;
  broadcastOrganizationId?: string;
  isSecret?: boolean;
}

export interface UpdateTestimonyRequestBody {
  title?: string;
  description?: string;
  tags?: string[];
  isBroadcast?: boolean;
  broadcastOrganizationId?: string;
  isSecret?: boolean;
}

export interface ReplyToTestimonyRequestBody {
  content: string;
}

export interface SendMessageRequestBody {
  recipientId: string;
  recipientType: "user" | "organization";
  content: string;
}

export interface UpdateMessageRequestBody {
  content: string;
}

// User Request Types
export interface UserUpdateRequestBody {
  isFlagged?: boolean;
}

export interface UserKYCActionRequestBody {
  adminId?: string;
  reason?: string;
}

// Data Management Request Types
export interface FAQCreateRequestBody {
  question: string;
  answer: string;
  order?: number;
}

export interface FAQUpdateRequestBody {
  question?: string;
  answer?: string;
  isActive?: boolean;
  order?: number;
}

export interface AuditLogFilterQuery extends PaginationQuery {
  adminId?: string;
  userId?: string;
  action?: string;
  resource?: string;
  level?: "info" | "warning" | "error" | "critical";
  category?: "auth" | "user" | "testimony" | "system" | "data" | "security";
  from?: string;
  to?: string;
}

export interface KYCActionRequestBody {
  reason?: string;
}

export interface SystemContentUpdateRequestBody {
  title: string;
  content: string;
  version?: string;
}

// Team Permission Request Types
export interface TeamPermissionUpdateRequestBody {
  permission?: string;
  description?: string;
}

// Query parameter types
export interface PaginationQuery {
  page?: number;
  limit?: number;
  isActive?: boolean;
}

export interface RoleFilterQuery extends PaginationQuery {
  isActive?: boolean;
}

export interface AdminFilterQuery extends PaginationQuery {
  role?: string;
  isActive?: boolean;
  [key: string]: any;
}

export interface DateRangeQuery extends PaginationQuery {
  from?: string;
  to?: string;
}

export interface SubscriptionFilterQuery extends PaginationQuery {
  status?: "active" | "cancelled" | "expired" | "trial";
  planId?: string;
}

export interface TestimonyFilterQuery extends PaginationQuery {
  userId?: string;
  flagged?: boolean;
  isFlagged?: boolean;
}

export interface UserFilterQuery extends PaginationQuery {
  isActive?: boolean;
  isFlagged?: boolean;
  accountType?: string;
  subscriptionType?: string;
}

export interface AuditLogFilterQuery extends PaginationQuery {
  adminId?: string;
  userId?: string;
  action?: string;
  resource?: string;
  level?: "info" | "warning" | "error" | "critical";
  category?: "auth" | "user" | "testimony" | "system" | "data" | "security";
  from?: string;
  to?: string;
  startDate?: string;
  endDate?: string;
}
