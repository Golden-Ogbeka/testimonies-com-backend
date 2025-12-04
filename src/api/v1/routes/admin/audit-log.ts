import { Router } from "express";
import { AdminAuditLogController } from "../../controllers/admin/audit-log";

const AdminAuditLogRouter = Router();
const Controller = AdminAuditLogController();

// Get audit logs

// Get single audit log by ID

// Log audit event (use a service for this to be reusable)

// Export admin audit logs

// View another admin's audit logs

// Export audit logs of another admin

export default AdminAuditLogRouter;
