import { Request, Response } from "express";
import { validationResult } from "express-validator";
import {
  sendCatchFeedback,
  sendErrorFeedback,
  sendSuccessFeedback,
  sendValidationErrorFeedback,
} from "../../../../functions/feedback";
import AuditLogModel from "../../../../models/audit-log.model";
import {
  AuditLogFilterQuery,
  PaginationQuery,
} from "../../../../types/requests";
import { getPaginationOptions } from "../../../../utils/pagination";

export const AdminAuditLogController = () => {
  const ViewAuditLogs = async (
    req: Request<never, never, never, AuditLogFilterQuery & PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const {
        page = 1,
        limit = 20,
        category,
        level,
        startDate,
        endDate,
      } = req.query as any;

      // Build filter
      const filter: any = {};
      if (category) filter.category = category;
      if (level) filter.level = level;
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate as string);
        if (endDate) filter.createdAt.$lte = new Date(endDate as string);
      }

      const paginationOptions = getPaginationOptions(req as any);

      const auditLogs = await AuditLogModel.paginate(filter, {
        ...paginationOptions,
        sort: { createdAt: -1 },
        populate: [{ path: "adminDetails" }, { path: "userDetails" }],
      });

      return sendSuccessFeedback(res, "Audit logs retrieved", {
        auditLogs,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const ViewAuditLog = async (req: Request, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const auditLog = await AuditLogModel.findById(id)
        .populate("adminDetails")
        .populate("userDetails");

      if (!auditLog) {
        return sendErrorFeedback(res, 404, "Audit log not found");
      }

      return sendSuccessFeedback(res, "Audit log retrieved", { auditLog });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const ViewAdminAuditLogs = async (req: Request, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { adminId } = req.params;

      const paginationOptions = getPaginationOptions(req as any);

      const auditLogs = await AuditLogModel.paginate(
        { adminId },
        {
          ...paginationOptions,
          sort: { createdAt: -1 },
          populate: [{ path: "adminDetails" }, { path: "userDetails" }],
        },
      );

      return sendSuccessFeedback(res, "Admin audit logs retrieved", {
        auditLogs: auditLogs,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  return {
    ViewAuditLogs,
    ViewAuditLog,
    ViewAdminAuditLogs,
  };
};
