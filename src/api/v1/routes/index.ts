import express from "express";
import { isValidAdminAPI, isValidAPI } from "../../../middleware/shared";
import AdminAuditLogRouter from "./admin/audit-log";
import AdminAuthRouter from "./admin/auth";
import AdminDataManagementRouter from "./admin/data-management";
import AdminPromotionRouter from "./admin/promotion";
import AdminRolePermissionRouter from "./admin/role-permission";
import AdminSubscriptionRouter from "./admin/subscription";
import AdminTestimonyRouter from "./admin/testimony";
import AdminUserRouter from "./admin/user";
import UserAddressRouter from "./user/address";
import UserAuthRouter from "./user/auth";
import UserMessagingRouter from "./user/messaging";
import UserProfileRouter from "./user/profile";
import UserPromotionRouter from "./user/promotion";
import UserSubscriptionRouter from "./user/subscription";
import UserTeamRouter from "./user/team";
import UserTestimonyRouter from "./user/testimony";

const V1Router = express.Router();

// Admin Routes
V1Router.use("/admin/auth", isValidAdminAPI, AdminAuthRouter);
V1Router.use("/admin/testimony", isValidAdminAPI, AdminTestimonyRouter);
V1Router.use("/admin/user", isValidAdminAPI, AdminUserRouter);
V1Router.use(
  "/admin/role-permission",
  isValidAdminAPI,
  AdminRolePermissionRouter,
);
V1Router.use("/admin/subscription", isValidAdminAPI, AdminSubscriptionRouter);
V1Router.use("/admin/promotion", isValidAdminAPI, AdminPromotionRouter);
V1Router.use("/admin/audit-log", isValidAdminAPI, AdminAuditLogRouter);
V1Router.use(
  "/admin/data-management",
  isValidAdminAPI,
  AdminDataManagementRouter,
);

// User Routes
V1Router.use("/user/auth", isValidAPI, UserAuthRouter);
V1Router.use("/user/testimony", isValidAPI, UserTestimonyRouter);
V1Router.use("/user/profile", isValidAPI, UserProfileRouter);
V1Router.use("/user/subscription", isValidAPI, UserSubscriptionRouter);
V1Router.use("/user/promotion", isValidAPI, UserPromotionRouter);
V1Router.use("/user/messaging", isValidAPI, UserMessagingRouter);
V1Router.use("/user/team", isValidAPI, UserTeamRouter);
V1Router.use("/user/address", isValidAPI, UserAddressRouter);

export default V1Router;
