import * as CompanyEmailValidator from "company-email-validator";
import { NextFunction, Request, Response } from "express";
import { sendErrorFeedback } from "../functions/feedback";

export const isBusinessEmail = async (email: string) => {
  return CompanyEmailValidator.isCompanyEmail(email);
};

export const hasFileUploaded = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const value = req.file || req.files;
  if (!value) return sendErrorFeedback(res, 400, "Please upload a file");

  next();
};
