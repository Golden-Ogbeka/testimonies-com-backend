import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { PRODUCT_NAME } from "../functions/env";
import { sendErrorFeedback } from "../functions/feedback";
// import AdminModel from "../models/admin.model";
import AdminModel from "../models/admin.model";
import OrganizationModel from "../models/organization.model";
import UserModel from "../models/user.model";

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const value = req.headers["x-jwt-token"];

    console.log(value);

    if (!value)
      return sendErrorFeedback(res, 401, "Unauthorized. Login to continue");

    const tokenData: any = jwt.verify(
      value as string,
      process.env.JWT_SECRET || "",
    );

    if (!tokenData)
      return sendErrorFeedback(res, 401, "Unauthorized. Login to continue");

    if (tokenData.domain !== PRODUCT_NAME)
      return sendErrorFeedback(res, 401, "Unauthorized. Login to continue");

    // Check if admin exists and is activated
    const isAdmin = await AdminModel.findOne({
      email: tokenData?.email,
      active: true,
    });

    if (!isAdmin)
      return sendErrorFeedback(res, 401, "Unauthorized. Contact Admin");

    next();
  } catch (error: any) {
    console.log(error);
    return sendErrorFeedback(res, 401, "Unauthorized");
  }
};

export const isSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const value = req.headers["x-jwt-token"];

    if (!value)
      return sendErrorFeedback(res, 401, "Unauthorized. Login to continue");

    const tokenData: any = jwt.verify(
      value as string,
      process.env.JWT_SECRET || "",
    );

    if (!tokenData)
      return sendErrorFeedback(res, 401, "Unauthorized. Login to continue");

    if (tokenData.domain !== PRODUCT_NAME)
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
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const value = req.headers["x-jwt-token"];

    if (!value)
      return sendErrorFeedback(res, 401, "Unauthorized. Login to continue");

    const tokenData: any = jwt.verify(
      value as string,
      process.env.JWT_SECRET || "",
    );

    if (!tokenData)
      return sendErrorFeedback(res, 401, "Unauthorized. Login to continue");

    if (tokenData.domain !== PRODUCT_NAME)
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
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const value = req.headers["x-jwt-token"];

    if (!value)
      return sendErrorFeedback(res, 401, "Unauthorized. Login to continue");

    const tokenData: any = jwt.verify(
      value as string,
      process.env.JWT_SECRET || "",
    );

    if (!tokenData)
      return sendErrorFeedback(res, 401, "Unauthorized. Login to continue");

    if (tokenData.domain !== PRODUCT_NAME)
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
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const value = req.headers["x-jwt-token"];

    if (!value)
      return sendErrorFeedback(res, 401, "Unauthorized. Login to continue");

    const tokenData: any = jwt.verify(
      value as string,
      process.env.JWT_SECRET || "",
    );

    if (!tokenData)
      return sendErrorFeedback(res, 401, "Unauthorized. Login to continue");

    if (tokenData.domain !== PRODUCT_NAME)
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
