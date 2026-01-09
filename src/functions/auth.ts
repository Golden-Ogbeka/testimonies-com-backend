import { Request } from "express";
import jwt from "jsonwebtoken";
// import AdminModel from "../models/admin.model";
import UserModel, { IUser } from "../models/user.model";

export const getUserDetails = async (req: Request) => {
  const authorization = req.headers.authorization;

  if (!authorization) throw new Error("Unauthorized");

  const tokenData: any = jwt.verify(
    authorization,
    process.env.JWT_SECRET || "",
  );

  if (!tokenData) throw new Error("Unauthorized");

  const details = await UserModel.findOne({
    email: tokenData?.email,
  });

  if (!details) throw new Error("Unauthorized!");

  return details;
};

export const getTokenData = (req: Request) => {
  const authorization = req.headers.authorization;

  if (!authorization) throw new Error("Unauthorized");

  const tokenData: any = jwt.verify(
    authorization,
    process.env.JWT_SECRET || "",
  );

  return tokenData || null;
};

// export const getAdminUserDetails = async (req: Request) => {
//   const authorization = req.headers.authorization;

//   if (!authorization) throw new Error("Unauthorized");

//   const tokenData: any = jwt.verify(
//     authorization,
//     process.env.JWT_SECRET || "",
//   );

//   if (!tokenData) throw new Error("Unauthorized");

//   const details = await AdminModel.findOne({
//     email: tokenData?.email,
//   });

//   if (!details) throw new Error("Unauthorized!");

//   return details;
// };

export const extractSensitiveUserInfo = (user: IUser) => {
  delete user.password;
  delete user.verificationCode;
  delete user.ntfToken;
  delete user.smsPinId;

  return user;
};
