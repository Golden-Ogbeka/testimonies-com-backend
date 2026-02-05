import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { PRODUCT_NAME } from "../functions/env";
import OrganizationModel from "../models/organization.model";
import UserModel from "../models/user.model";

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const value = req.headers.authorization;

    if (!value) {
      // No token provided, continue without authentication
      return next();
    }

    const tokenData: any = jwt.verify(value, process.env.JWT_SECRET || "");

    if (!tokenData || tokenData.domain !== PRODUCT_NAME) {
      // Invalid token, continue without authentication
      return next();
    }

    // Check if user or organization exists and is active
    const user = await UserModel.findOne({
      email: tokenData?.email,
      active: true,
      isFlagged: false,
    });

    const organization = await OrganizationModel.findOne({
      businessEmail: tokenData?.email,
      active: true,
      isFlagged: false,
    });

    if (user || organization) {
      // Add user info to request for use in controller
      (req as any).user = user || organization;
      (req as any).userType = user ? "user" : "organization";
    }

    next();
  } catch (error: any) {
    // Token verification failed, continue without authentication
    next();
  }
};

export const getOptionalUserDetails = async (req: Request) => {
  try {
    const value = req.headers.authorization;

    if (!value) {
      // No token provided, continue without authentication
      return null;
    }

    const tokenData: any = jwt.verify(value, process.env.JWT_SECRET || "");

    if (!tokenData || tokenData.domain !== PRODUCT_NAME) {
      // Invalid token, continue without authentication
      return null;
    }

    // Check if user or organization exists and is active
    const user = await UserModel.findOne({
      email: tokenData?.email,
      active: true,
      isFlagged: false,
    });

    const organization = await OrganizationModel.findOne({
      businessEmail: tokenData?.email,
      active: true,
      isFlagged: false,
    });

    if (!user && !organization) return null;

    return user || organization;
  } catch (error: any) {
    // Token verification failed, continue without authentication
    return null;
  }
};
