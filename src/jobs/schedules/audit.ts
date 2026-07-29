import { AgendaControl } from "..";
import { CRON_JOB_NAMES } from "../data";

type AuditLogData = {
  adminId: string;
  action: string;
  category: "auth" | "user" | "testimony" | "system" | "data" | "security";
  details?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
};

export const AuditCronSchedules = {
  createAuditLogNow: async (data: AuditLogData) => {
    await AgendaControl.now(CRON_JOB_NAMES.CREATE_AUDIT_LOG, data);
  },
};
