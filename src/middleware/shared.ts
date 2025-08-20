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
