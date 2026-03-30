import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { PRODUCT_NAME } from "../functions/env";
import { sendErrorFeedback } from "../functions/feedback";
import AdminModel from "../models/admin.model";
import OrganizationModel from "../models/organization.model";
import UserModel from "../models/user.model";
import { CustomRequest, JWTPayload } from "../types";

export const isAdmin = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const value = req.headers["x-jwt-token"];

    if (!value)
      return sendErrorFeedback(res, 401, "Unauthorized. Login to continue");

    const tokenData = jwt.verify(
      value as string,
      process.env.JWT_SECRET || "",
    ) as JWTPayload;

    if (!tokenData || tokenData.domain !== PRODUCT_NAME)
      return sendErrorFeedback(res, 401, "Unauthorized. Login to continue");

    // Check if admin exists and is activated
    const isAdmin = await AdminModel.findOne({
      email: tokenData?.email,
      active: true,
    });

    if (!isAdmin)
      return sendErrorFeedback(res, 401, "Unauthorized. Contact Admin");

    next();
  } catch (error: unknown) {
    return sendErrorFeedback(res, 401, "Unauthorized");
  }
};

export const isSuperAdmin = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const value = req.headers["x-jwt-token"];

    if (!value)
      return sendErrorFeedback(res, 401, "Unauthorized. Login to continue");

    const tokenData = jwt.verify(
      value as string,
      process.env.JWT_SECRET || "",
    ) as JWTPayload;

    if (!tokenData || tokenData.domain !== PRODUCT_NAME)
      return sendErrorFeedback(res, 401, "Unauthorized. Login to continue");

    // Check if admin exists, is super admin and is activated
    const isSuperAdmin = await AdminModel.findOne({
      email: tokenData?.email,
      active: true,
      role: "super-admin",
    });

    if (!isSuperAdmin)
      return sendErrorFeedback(
        res,
        401,
        "You don't have permission to access this resource",
      );

    next();
  } catch (error: any) {
    return sendErrorFeedback(res, 401, "Unauthorized");
  }
};

export const isUserOrOrganization = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const value = req.headers["x-jwt-token"];

    if (!value)
      return sendErrorFeedback(res, 401, "Unauthorized. Login to continue");

    const tokenData = jwt.verify(
      value as string,
      process.env.JWT_SECRET || "",
    ) as JWTPayload;

    if (!tokenData || tokenData.domain !== PRODUCT_NAME)
      return sendErrorFeedback(res, 401, "Unauthorized. Login to continue");

    // Check if admin exists and is activated
    const isUser =
      (await UserModel.findOne({
        email: tokenData?.email,
        active: true,
        isFlagged: false,
      })) ||
      (await OrganizationModel.findOne({
        businessEmail: tokenData?.email,
        active: true,
        isFlagged: false,
      }));

    if (!isUser)
      return sendErrorFeedback(res, 401, "Unauthorized. Contact Admin");

    next();
  } catch (error: any) {
    return sendErrorFeedback(res, 401, "Unauthorized");
  }
};
export const isUser = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const value = req.headers["x-jwt-token"];

    if (!value)
      return sendErrorFeedback(res, 401, "Unauthorized. Login to continue");

    const tokenData = jwt.verify(
      value as string,
      process.env.JWT_SECRET || "",
    ) as JWTPayload;

    if (!tokenData || tokenData.domain !== PRODUCT_NAME)
      return sendErrorFeedback(res, 401, "Unauthorized. Login to continue");

    // Check if admin exists and is activated
    const isUser = await UserModel.findOne({
      email: tokenData?.email,
      active: true,
      isFlagged: false,
    });

    if (!isUser)
      return sendErrorFeedback(res, 401, "Unauthorized. Contact Admin");

    next();
  } catch (error: any) {
    return sendErrorFeedback(res, 401, "Unauthorized");
  }
};
export const isOrganization = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const value = req.headers["x-jwt-token"];

    if (!value)
      return sendErrorFeedback(res, 401, "Unauthorized. Login to continue");

    const tokenData = jwt.verify(
      value as string,
      process.env.JWT_SECRET || "",
    ) as JWTPayload;

    if (!tokenData || tokenData.domain !== PRODUCT_NAME)
      return sendErrorFeedback(res, 401, "Unauthorized. Login to continue");

    // Check if admin exists and is activated
    const isOrg = await OrganizationModel.findOne({
      businessEmail: tokenData?.email,
      active: true,
      isFlagged: false,
    });

    if (!isOrg)
      return sendErrorFeedback(res, 401, "Unauthorized. Contact Admin");

    next();
  } catch (error: any) {
    return sendErrorFeedback(res, 401, "Unauthorized");
  }
};
