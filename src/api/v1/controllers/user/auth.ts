import { Request, Response } from "express";
import { sendCatchFeedback } from "../../../../functions/feedback";

export const UserAuthController = () => {
  const SignupOrganization = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const SignupIndividual = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const SendSignupOTP = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const VerifySignupOTP = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const ResendSignupOTP = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const Signin = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const SendSigninOTP = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const VerifySigninOTP = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const ResendSigninOTP = async (req: Request, res: Response) => {
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

  const GoogleAuth = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };
  
  const GoogleOAuthCallback = async (req: Request, res: Response) => {
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

  const GetSessions = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const DeleteOtherSessions = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const DeleteSession = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  return {
    SignupOrganization,
    SignupIndividual,
    SendSignupOTP,
    VerifySignupOTP,
    ResendSignupOTP,
    Signin,
    SendSigninOTP,
    VerifySigninOTP,
    ResendSigninOTP,
    ResetPassword,
    ResetPasswordUpdate,
    GoogleAuth,
    GoogleOAuthCallback,
    Logout,
    GetSessions,
    DeleteOtherSessions,
    DeleteSession,
  };
};
