import { Request, Response } from "express";
import { sendCatchFeedback } from "../../../../functions/feedback";

export const AdminAuditLogController = () => {
  const ViewAuditLogs = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const ViewAuditLog = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const LogAuditEvent = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const ExportAudiLogs = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const ViewAdminAuditLogs = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const ExportAdminAudiLogs = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  return {
    ViewAuditLogs,
    ViewAuditLog,
    LogAuditEvent,
    ExportAudiLogs,
    ViewAdminAuditLogs,
    ExportAdminAudiLogs,
  };
};
