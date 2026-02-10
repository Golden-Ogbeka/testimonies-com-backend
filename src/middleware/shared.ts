import { NextFunction, Request, Response } from "express";
import { sendErrorFeedback } from "../functions/feedback";

export const isValidAPI = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const API_KEY = process.env.API_KEY;

  const value = req.headers["x-api-key"];

  if (!value) return sendErrorFeedback(res, 403, "API key is required");

  if (API_KEY !== value) {
    return sendErrorFeedback(res, 403, "Invalid API key");
  }

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
