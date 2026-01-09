import { Router } from "express";
import { param } from "express-validator";
import { isValidObjectId } from "../../../../middleware/validation";
import { AdminAuditLogController } from "../../controllers/admin/audit-log";

const AdminAuditLogRouter = Router();
const Controller = AdminAuditLogController();

// Get audit logs
AdminAuditLogRouter.get("/", Controller.ViewAuditLogs);

// Get single audit log by ID
AdminAuditLogRouter.get(
  "/details/:id",
  param("id", "ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.ViewAuditLog,
);

// Log audit event (use a service for this to be reusable)
AdminAuditLogRouter.post("/log-event", Controller.LogAuditEvent);

// Export admin audit logs
AdminAuditLogRouter.post("/export-log", Controller.ExportAudiLogs);

// View another admin's audit logs
AdminAuditLogRouter.get(
  "/admin-logs/:adminId",
  param("adminId", "Admin ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.ViewAdminAuditLogs,
);

// Export audit logs of another admin
AdminAuditLogRouter.post(
  "/export-admin-log/:auditLogId",
  param("auditLogId", "Audit Log ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.ExportAdminAudiLogs,
);

export default AdminAuditLogRouter;
