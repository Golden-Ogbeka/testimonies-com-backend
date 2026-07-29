import Agenda from "agenda";
import colors from "colors/safe";
import AuditLogModel from "../../models/audit-log.model";
import { CRON_JOB_NAMES } from "../data";

type AuditLogJobData = {
  adminId: string;
  action: string;
  category: "auth" | "user" | "testimony" | "system" | "data" | "security";
  details?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
};

export const AuditCronDefinitions = (agenda: Agenda) => {
  agenda.define(CRON_JOB_NAMES.CREATE_AUDIT_LOG, async (job, done) => {
    try {
      const { attrs } = job;
      const data = attrs.data as AuditLogJobData;

      await AuditLogModel.create({
        adminId: data.adminId,
        action: data.action,
        category: data.category,
        details: data.details,
        email: data.email,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      });

      done();
    } catch (error) {
      console.log("CRON:", colors.red(JSON.stringify(error)));
    }
  });
};
