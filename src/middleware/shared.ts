import { NextFunction, Request, Response } from "express";
import { API_KEY } from "../functions/env";
import { sendErrorFeedback } from "../functions/feedback";
import { ErrorCodes } from "../utils/error-codes";

export const isValidAPI = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const value = req.headers["x-api-key"];
  if (!value)
    return sendErrorFeedback(res, 401, "API key is required", {
      code: ErrorCodes.API_KEY_REQUIRED,
    });
  if (API_KEY !== value)
    return sendErrorFeedback(res, 401, "Invalid API key", {
      code: ErrorCodes.INVALID_API_KEY,
    });
  next();
};

export const isValidAdminAPI = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

  const value = req.headers["x-admin-api-key"];

  if (!value) return sendErrorFeedback(res, 403, "Admin API key is required");

  if (ADMIN_API_KEY !== value) {
    return sendErrorFeedback(res, 403, "Invalid Admin API key");
  }

  next();
};
