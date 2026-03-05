import bcryptjs from "bcryptjs";
import { Response } from "express";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { generateRandomNumbers } from "../../../../functions";
import {
  getAdminUserDetails,
  getClientIPAndUserAgent,
} from "../../../../functions/auth";
import {
  JWT_SECRET,
  OTP_EXPIRY,
  PRODUCT_NAME,
} from "../../../../functions/env";
import {
  sendCatchFeedback,
  sendErrorFeedback,
  sendSuccessFeedback,
  sendValidationErrorFeedback,
} from "../../../../functions/feedback";
import { AdminCronSchedules } from "../../../../jobs/schedules/admin";
import AdminModel, { IAdmin } from "../../../../models/admin.model";
import AuditLogModel from "../../../../models/audit-log.model";
import AuthSessionModel from "../../../../models/auth-session.model";
import { CustomRequest } from "../../../../types/express";
import {
  AdminChangePasswordRequestBody,
  AdminProfileUpdateRequestBody,
  AdminResendOTPRequestBody,
  AdminResetPasswordRequestBody,
  AdminResetPasswordUpdateRequestBody,
  AdminSigninRequestBody,
  AdminVerifyOTPRequestBody,
} from "../../../../types/requests";
import { notifyUser } from "../../services/notification";

export const AdminAuthController = () => {
  const Login = async (
    req: CustomRequest<never, any, AdminSigninRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { email, password } = req.body;
      const { ipAddress, userAgent } = getClientIPAndUserAgent(req);

      // find admin
      const existingAdmin = await AdminModel.findOne({ email });

      if (!existingAdmin) {
        return sendErrorFeedback(res, 400, "Invalid email or password");
      }

      // Check if admin is activated
      if (!existingAdmin.active) {
        return sendErrorFeedback(res, 400, "Access Denied. Contact Admin");
      }

      // compare passwords
      const isPasswordValid = await bcryptjs.compare(
        password,
        existingAdmin.password,
      );
      if (!isPasswordValid) {
        await AdminModel.updateOne(
          { _id: existingAdmin._id },
          { lastLoginAttempt: new Date() },
        );

        await AuditLogModel.create({
          adminId: existingAdmin._id,
          action: "FAILED_LOGIN_ATTEMPT",
          resource: "admin_auth",
          ipAddress,
          userAgent,
          level: "info",
          category: "auth",
          details: { email, success: false },
        });
        return sendErrorFeedback(res, 400, "Invalid email or password");
      }

      // Generate OTP
      const otp = generateRandomNumbers(6);

      existingAdmin.verificationCode = otp;
      existingAdmin.lastSuccessfulLogin = new Date();
      existingAdmin.lastLoginAttempt = new Date();
      await existingAdmin.save();

      // Send OTP
      await notifyUser({
        sendEmailNotification: true,
        title: "OTP for Admin Login",
        userDetails: existingAdmin as unknown as IAdmin,
        message: `Use <b>${existingAdmin.verificationCode}</b> as your OTP<br />OTP expires ${OTP_EXPIRY}. If you did not attempt to login, please contact support`,
      });

      await AdminCronSchedules.resetOTP(email);

      // Log audit event
      await AuditLogModel.create({
        adminId: existingAdmin._id,
        action: "LOGIN_SUCCESS",
        resource: "admin_auth",
        ipAddress,
        userAgent,
        level: "info",
        category: "auth",
        details: { email, success: true },
      });

      return sendSuccessFeedback(res, "Login successful. Please verify OTP", {
        adminId: existingAdmin._id,
        email: existingAdmin.email,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const Logout = async (req: CustomRequest, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const authorization = req.headers.authorization;
      if (!authorization) {
        return sendErrorFeedback(res, 401, "No token provided");
      }

      // Remove token from blacklist or invalidate session
      await AuthSessionModel.deleteMany({ token: authorization });

      return sendSuccessFeedback(res, "Logged out successfully");
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const VerifyOTP = async (
    req: CustomRequest<never, any, AdminVerifyOTPRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { email, otp } = req.body;
      const { ipAddress, userAgent } = getClientIPAndUserAgent(req);

      const admin = await AdminModel.findOne({ email });
      if (!admin) {
        return sendErrorFeedback(res, 400, "Admin not found");
      }

      if (admin.verificationCode !== otp) {
        // Log audit event
        await AuditLogModel.create({
          adminId: admin._id,
          action: "FAILED_OTP_VERIFICATION",
          resource: "admin_auth",
          ipAddress,
          userAgent,
          level: "info",
          category: "auth",
          details: { email, success: false },
        });
        return sendErrorFeedback(res, 400, "Invalid OTP");
      }

      // Clear OTP
      await AdminModel.updateOne(
        { _id: admin._id },
        { verificationCode: undefined, emailIsVerified: true },
      );

      // Generate JWT token
      const token = jwt.sign(
        {
          email: admin.email,
          domain: PRODUCT_NAME!,
          role: admin.role,
          adminId: admin._id,
        },
        JWT_SECRET!,
        { expiresIn: "2d" },
      );

      // Create auth session
      await AuthSessionModel.create({
        token,
        userId: admin._id,
        userType: "admin",
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      });

      await AuditLogModel.create({
        adminId: admin._id,
        action: "SUCCESSFUL_OTP_VERIFICATION",
        resource: "admin_auth",
        ipAddress,
        userAgent,
        level: "info",
        category: "auth",
        details: { email, success: true },
      });

      return sendSuccessFeedback(res, "OTP verified successfully", {
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.role,
          permissions: admin.permissions,
        },
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const ResendOTP = async (
    req: CustomRequest<never, any, AdminResendOTPRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { email } = req.body;

      const admin = await AdminModel.findOne({ email });
      if (!admin) {
        return sendErrorFeedback(res, 400, "Admin not found");
      }

      // Generate new OTP
      const otp = generateRandomNumbers(6);

      // Update admin with new OTP
      await AdminModel.updateOne({ _id: admin._id }, { verificationCode: otp });

      // Send OTP
      await notifyUser({
        sendEmailNotification: true,
        title: "OTP for Admin Login",
        userDetails: admin as unknown as IAdmin,
        message: `Use <b>${otp}</b> as your OTP<br />OTP expires ${OTP_EXPIRY}. If you did not attempt to login, please contact support`,
      });

      return sendSuccessFeedback(res, "OTP resent successfully");
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const ResetPassword = async (
    req: CustomRequest<never, any, AdminResetPasswordRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { email } = req.body;

      const admin = await AdminModel.findOne({ email });
      if (!admin) {
        return sendErrorFeedback(res, 400, "Admin not found");
      }

      const verificationCode = generateRandomNumbers(6);

      admin.verificationCode = verificationCode;

      await admin.save();

      // Send OTP
      await notifyUser({
        sendEmailNotification: true,
        title: "OTP for Password Reset",
        userDetails: admin as unknown as IAdmin,
        message: `Use <b>${admin.verificationCode}</b> as your OTP<br />OTP expires ${OTP_EXPIRY}. If you did not attempt to login, please contact support`,
      });

      // Run cron to clear OTP after expiry
      await AdminCronSchedules.resetOTP(email);

      // Log event
      await AuditLogModel.create({
        adminId: admin._id,
        action: "PASSWORD_RESET_CODE_SENT",
        resource: "admin_auth",
        level: "info",
        category: "auth",
        details: { email },
      });

      return sendSuccessFeedback(res, "Password reset code sent");
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const ResetPasswordUpdate = async (
    req: CustomRequest<never, any, AdminResetPasswordUpdateRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { otp, newPassword, email } = req.body;

      const admin = await AdminModel.findOne({
        email: email,
        verificationCode: otp,
      });

      if (!admin) {
        return sendErrorFeedback(res, 400, "Invalid or expired reset token");
      }

      // Hash new password
      const hashedPassword = await bcryptjs.hash(newPassword, 8);

      // Update password and clear reset token
      await AdminModel.updateOne(
        { _id: admin._id },
        {
          password: hashedPassword,
          verificationCode: undefined,
        },
      );

      return sendSuccessFeedback(res, "Password reset successfully");
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const ChangePassword = async (
    req: CustomRequest<never, any, AdminChangePasswordRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { currentPassword, newPassword } = req.body;
      const admin = await getAdminUserDetails(req);

      // Verify current password
      const isCurrentPasswordValid = await bcryptjs.compare(
        currentPassword,
        admin.password,
      );
      if (!isCurrentPasswordValid) {
        return sendErrorFeedback(res, 400, "Current password is incorrect");
      }

      // Hash new password
      const hashedPassword = await bcryptjs.hash(newPassword, 8);

      // Update password
      await AdminModel.updateOne(
        { _id: admin._id },
        { password: hashedPassword },
      );

      return sendSuccessFeedback(res, "Password changed successfully");
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetProfile = async (req: CustomRequest, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const admin = await getAdminUserDetails(req);

      return sendSuccessFeedback(res, "Profile retrieved", { admin });
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const UpdateProfile = async (
    req: CustomRequest<never, any, AdminProfileUpdateRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const admin = await getAdminUserDetails(req);

      const { firstName, lastName, phoneNumber } = req.body;

      admin.firstName = firstName || admin.firstName;
      admin.lastName = lastName || admin.lastName;
      admin.phoneNumber = phoneNumber || admin.phoneNumber;
      admin.updatedBy = admin._id as Types.ObjectId;

      await admin.save();

      // Log event
      await AuditLogModel.create({
        adminId: admin._id,
        action: "PROFILE_UPDATED",
        resource: "admin_auth",
        level: "info",
        category: "auth",
        details: { email: admin.email },
      });

      return sendSuccessFeedback(res, "Profile updated successfully", {
        admin,
      });
    } catch (error: unknown) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  return {
    Login,
    Logout,
    VerifyOTP,
    ResendOTP,
    ResetPassword,
    ResetPasswordUpdate,
    ChangePassword,
    GetProfile,
    UpdateProfile,
  };
};
