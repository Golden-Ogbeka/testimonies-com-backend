import { Request, Response } from "express";
import { sendCatchFeedback } from "../../../../functions/feedback";

export const AdminAuditLogController = () => {
  const ViewAuditLogs = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const ViewAuditLog = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const LogAuditEvent = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const ExportAudiLogs = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const ViewAdminAuditLogs = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const ExportAdminAudiLogs = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
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
