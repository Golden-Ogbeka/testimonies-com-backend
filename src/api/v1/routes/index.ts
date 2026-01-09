import express from "express";
import AdminAuditLogRouter from "./admin/audit-log";
import AdminAuthRouter from "./admin/auth";
import AdminDataManagementRouter from "./admin/data-management";
import AdminPromotionRouter from "./admin/promotion";
import AdminRolePermissionRouter from "./admin/role-permission";
import AdminSubscriptionRouter from "./admin/subscription";
import AdminTestimonyRouter from "./admin/testimony";
import AdminUserRouter from "./admin/user";
import UserAddressRouter from "./user/address";
import UserAnalyticsRouter from "./user/analytics";
import UserAuthRouter from "./user/auth";
import UserMessagingRouter from "./user/messaging";
import UserProfileRouter from "./user/profile";
import UserPromotionRouter from "./user/promotion";
import UserSettingsRouter from "./user/settings";
import UserSubscriptionRouter from "./user/subscription";
import UserTeamRouter from "./user/team";
import UserTestimonyRouter from "./user/testimony";

const V1Router = express.Router();

// Admin Routes
V1Router.use("/admin/auth", AdminAuthRouter);
V1Router.use("/admin/testimony", AdminTestimonyRouter);
V1Router.use("/admin/user", AdminUserRouter);
V1Router.use("/admin/role-permission", AdminRolePermissionRouter);
V1Router.use("/admin/subscription", AdminSubscriptionRouter);
V1Router.use("/admin/promotion", AdminPromotionRouter);
V1Router.use("/admin/audit-log", AdminAuditLogRouter);
V1Router.use("/admin/data-management", AdminDataManagementRouter);

// User Routes
V1Router.use("/user/auth", UserAuthRouter);
V1Router.use("/user/testimony", UserTestimonyRouter);
V1Router.use("/user/profile", UserProfileRouter);
V1Router.use("/user/settings", UserSettingsRouter);
V1Router.use("/user/subscription", UserSubscriptionRouter);
V1Router.use("/user/promotion", UserPromotionRouter);
V1Router.use("/user/analytics", UserAnalyticsRouter);
V1Router.use("/user/messaging", UserMessagingRouter);
V1Router.use("/user/team", UserTeamRouter);
V1Router.use("/user/address", UserAddressRouter);

export default V1Router;
