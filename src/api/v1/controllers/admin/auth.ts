import { Request, Response } from "express";
import { sendCatchFeedback } from "../../../../functions/feedback";

export const AdminAuthController = () => {
  const Login = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const Logout = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const VerifyOTP = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const ResendOTP = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const ResetPassword = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const ResetPasswordUpdate = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const ChangePassword = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetProfile = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const UpdateProfile = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
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
