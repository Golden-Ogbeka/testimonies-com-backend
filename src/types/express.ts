import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { IAdmin } from "../models/admin.model";
import { IOrganization } from "../models/organization.model";
import { IUser } from "../models/user.model";

export interface CustomRequest<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs,
  Locals extends Record<string, any> = Record<string, any>,
> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {
  user?: IUser | IOrganization;
  userType?: "user" | "organization";
  admin?: IAdmin;
  requestId?: string;
  fileCount?: number;
}

export interface AuthRequest<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs,
  Locals extends Record<string, any> = Record<string, any>,
> extends CustomRequest<P, ResBody, ReqBody, ReqQuery, Locals> {
  user: IUser | IOrganization;
}

export interface AuthUserRequest<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs,
  Locals extends Record<string, any> = Record<string, any>,
> extends CustomRequest<P, ResBody, ReqBody, ReqQuery, Locals> {
  user: IUser | IOrganization;
}

export interface AuthAdminRequest<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs,
  Locals extends Record<string, any> = Record<string, any>,
> extends CustomRequest<P, ResBody, ReqBody, ReqQuery, Locals> {
  admin: IAdmin;
}

export interface JWTPayload {
  email: string;
  domain: string;
  iat?: number;
  exp?: number;
}
