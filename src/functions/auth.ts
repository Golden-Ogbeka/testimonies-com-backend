import { Request } from "express";
import jwt from "jsonwebtoken";
// import AdminModel from "../models/admin.model";
import { UAParser } from "ua-parser-js";
import AdminModel, { IAdmin } from "../models/admin.model";
import OrganizationModel, { IOrganization } from "../models/organization.model";
import UserModel, { IUser } from "../models/user.model";

export const getUserDetails = async (req: Request) => {
  const authorization = req.headers["x-jwt-token"];

  if (!authorization) throw new Error("Unauthorized");

  const tokenData: any = jwt.verify(
    authorization as string,
    process.env.JWT_SECRET || "",
  );

  if (!tokenData) throw new Error("Unauthorized");

  const details =
    (await UserModel.findOne({
      email: tokenData?.email,
    })) ||
    (await OrganizationModel.findOne({
      businessEmail: tokenData?.email,
    }));

  if (!details) throw new Error("Unauthorized!");

  return details as IUser | IOrganization;
};

export const getTokenData = (req: Request) => {
  const authorization = req.headers["x-jwt-token"];

  if (!authorization) throw new Error("Unauthorized");

  const tokenData: any = jwt.verify(
    authorization as string,
    process.env.JWT_SECRET || "",
  );

  return tokenData || null;
};

export const getAdminUserDetails = async (req: Request) => {
  const authorization = req.headers["x-jwt-token"];

  if (!authorization) throw new Error("Unauthorized");

  const tokenData: any = jwt.verify(
    authorization as string,
    process.env.JWT_SECRET || "",
  );

  if (!tokenData) throw new Error("Unauthorized");

  const details = await AdminModel.findOne({
    email: tokenData?.email,
  });

  if (!details) throw new Error("Unauthorized!");

  return details as IAdmin;
};

export const extractSensitiveUserInfo = (user: IUser) => {
  delete user.password;
  delete user.verificationCode;
  delete user.ntfToken;
  delete user.smsPinId;

  return user;
};

export const parseUserAgent = (userAgentString: string) => {
  const parser = new UAParser(userAgentString);
  const result = parser.getResult();
  return {
    deviceType: result.device.type || "unknown",
    os: result.os.name || "unknown",
    osVersion: result.os.version || "unknown",
    model: result.device.model || "unknown",
    manufacturer: result.device.vendor || "unknown",
  };
};

export async function getLocationFromIP(ip: string | undefined) {
  try {
    if (!ip) return null;

    // Use a free IP geolocation API
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    if (!response.ok) return null;

    const data = await response.json();
    return {
      city: data.city || null,
      region: data.region || null,
      country: data.country_name || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
    };
  } catch (error) {
    console.error("Error fetching location from IP:", error);
    return null;
  }
}

export const getClientIPAndUserAgent = (req: Request) => {
  const userAgent = req.headers["user-agent"] || "unknown";
  const ipAddress =
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    req.ip ||
    "unknown";

  return { ipAddress, userAgent };
};
