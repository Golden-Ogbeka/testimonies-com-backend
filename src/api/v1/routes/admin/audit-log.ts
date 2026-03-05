import { Router } from "express";
import { param, query } from "express-validator";
import { isAdmin } from "../../../../middleware/auth";
import { isValidObjectId } from "../../../../middleware/validation";
import { AdminAuditLogController } from "../../controllers/admin/audit-log";

const AdminAuditLogRouter = Router();
const Controller = AdminAuditLogController();

// Get audit logs
AdminAuditLogRouter.get(
  "/",
  [
    isAdmin,
    query("page", "Page must be a number").optional().isNumeric(),
    query("limit", "Limit must be a number").optional().isNumeric(),
    query("category", "Invalid category")
      .optional()
      .isIn(["auth", "user", "testimony", "system", "data", "security"]),
    query("level", "Invalid level")
      .optional()
      .isIn(["info", "warning", "error", "critical"]),
    query("startDate", "Invalid start date format").optional().isISO8601(),
    query("endDate", "Invalid end date format").optional().isISO8601(),
  ],
  Controller.ViewAuditLogs,
);

// Get single audit log by ID
AdminAuditLogRouter.get(
  "/details/:id",
  [
    isAdmin,
    param("id", "ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.ViewAuditLog,
);

// View another admin's audit logs
AdminAuditLogRouter.get(
  "/admin-logs/:adminId",
  [
    param("adminId", "Admin ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
    query("page", "Page must be a number").optional().isNumeric(),
    query("limit", "Limit must be a number").optional().isNumeric(),
  ],
  Controller.ViewAdminAuditLogs,
);

export default AdminAuditLogRouter;
