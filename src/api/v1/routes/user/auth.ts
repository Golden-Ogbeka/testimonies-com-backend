import { Router } from "express";
import { UserAuthController } from "../../controllers/user/auth";

const UserAuthRouter = Router();
const Controller = UserAuthController();

// Sign up as organization
UserAuthRouter.post("/signup/organization", Controller.SignupOrganization);

// Sign up as individual
UserAuthRouter.post("/signup/individual", Controller.SignupIndividual);

// Send Email verification OTP for signup
UserAuthRouter.post("/signup/send-otp", Controller.SendSignupOTP);

// Verify verification otp for email for sign up
UserAuthRouter.post("/signup/verify-otp", Controller.VerifySignupOTP);

// Resend OTP for email for sign up
UserAuthRouter.post("/signup/resend-otp", Controller.ResendSignupOTP);

// Sign in with email with 2fa required. Set triedLogin variable to ensure that 2fa verification can only work within the timing of that variable being true (5 mins)
UserAuthRouter.post("/signin", Controller.Signin);

// Send Email verification OTP for signin (dependent on triedLogin variable)
UserAuthRouter.post("/signin/send-otp", Controller.SendSigninOTP);

// Verify verification otp for email for signin (dependent on triedLogin variable)
UserAuthRouter.post("/signin/verify-otp", Controller.VerifySigninOTP);

// Resend OTP for email verification for signin (dependent on triedLogin variable)
UserAuthRouter.post("/signin/resend-otp", Controller.ResendSigninOTP);

// Reset password with email
UserAuthRouter.post("/reset-password", Controller.ResetPassword);

// Update password during reset (dependent on triedPasswordReset variable)
UserAuthRouter.post("/reset-password/update", Controller.ResetPasswordUpdate);

// Sign in and sign up with google (automatic verification of email)
UserAuthRouter.post("/google", Controller.GoogleAuth);

// Logout
UserAuthRouter.post("/logout", Controller.Logout);

// Get user sessions
UserAuthRouter.get("/sessions", Controller.GetSessions);

// Delete all other user sessions
UserAuthRouter.delete("/sessions/others", Controller.DeleteOtherSessions);

// Delete specific user session
UserAuthRouter.delete("/sessions/:sessionId", Controller.DeleteSession);

export default UserAuthRouter;
