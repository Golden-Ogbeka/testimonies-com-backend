import { Router } from "express";
import { body, param } from "express-validator";
import { isUserOrOrganization } from "../../../../middleware/auth";
import { isBusinessEmail } from "../../../../middleware/field-check";
import { UserAuthController } from "../../controllers/user/auth";

const UserAuthRouter = Router();
const Controller = UserAuthController();

// check for user name availability
UserAuthRouter.get(
  "/username/:username",
  [
    param("username", "Username is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long"),
  ],
  Controller.CheckUsername,
);

// Sign up as organization
UserAuthRouter.post(
  "/signup/organization",
  [
    body("username", "Username is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long"),
    body("businessName", "Business name is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 2 })
      .withMessage("Business name must be at least 2 characters long"),
    body("businessEmail", "Business email is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail({ all_lowercase: true })
      .custom((value) => isBusinessEmail(value))
      .withMessage("Please enter a company email")
      .isLength({ max: 100 })
      .withMessage("Email cannot have more than 100 characters."),
    body("businessPhoneNumber", "Phone number is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isMobilePhone("any", { strictMode: true })
      .withMessage(
        "Invalid mobile number. Please, make sure to add the preceding country or city code.",
      ),
    body("password", "Password is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number")
      .matches(/[!@#$%^&*]/)
      .withMessage(
        "Password must contain at least one special character (!@#$%^&*)",
      ),

    body("businessAddress", "Business address is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 2 })
      .withMessage("Business address must be at least 2 characters long"),
  ],
  Controller.SignupOrganization,
);

// Sign up as individual
UserAuthRouter.post(
  "/signup/individual",
  [
    body("username", "Username is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long"),
    body("firstName", "First name is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 2 })
      .withMessage("First name must be at least 2 characters long"),
    body("lastName", "Last name is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 2 })
      .withMessage("Last name must be at least 2 characters long"),
    body("email", "Email is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail({ all_lowercase: true })
      .isLength({ max: 100 })
      .withMessage("Email cannot have more than 100 characters."),
    body("phoneNumber", "Phone number is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isMobilePhone("any", { strictMode: true })
      .withMessage(
        "Invalid mobile number. Please, make sure to add the preceding country or city code.",
      ),
    body("password", "Password is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number")
      .matches(/[!@#$%^&*]/)
      .withMessage(
        "Password must contain at least one special character (!@#$%^&*)",
      ),
  ],
  Controller.SignupIndividual,
);

// Send Email verification OTP for signup
UserAuthRouter.post(
  "/signup/send-otp",
  [
    body("email", "Email is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isEmail()
      .normalizeEmail({ all_lowercase: true })
      .withMessage("Invalid Email format"),
  ],
  Controller.SendSignupOTP,
);

// Verify verification otp for email for sign up
UserAuthRouter.post(
  "/signup/verify-otp",
  [
    body("email", "Email is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isEmail()
      .normalizeEmail({ all_lowercase: true })
      .withMessage("Invalid Email format"),

    body("verificationCode", "Verification code is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim(),
  ],
  Controller.VerifySignupOTP,
);

// Resend OTP for email for sign up
// This was done to add a time check before resending OTPs to avoid spamming
UserAuthRouter.post(
  "/signup/resend-otp",
  [
    body("email", "Email is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isEmail()
      .normalizeEmail({ all_lowercase: true })
      .withMessage("Invalid Email format"),
  ],
  Controller.ResendSignupOTP,
);

// Sign in with email with 2fa required. Set triedLogin variable to ensure that 2fa verification can only work within the timing of that variable being true (5 mins)
UserAuthRouter.post(
  "/signin",
  [
    body("email", "Email is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isEmail()
      .normalizeEmail({ all_lowercase: true })
      .withMessage("Invalid Email format"),
    body("password", "Password is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim(),
  ],
  Controller.Signin,
);

// Send Email verification OTP for signin (dependent on triedLogin variable)
UserAuthRouter.post(
  "/signin/send-otp",
  [
    body("email", "Email is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isEmail()
      .normalizeEmail({ all_lowercase: true })
      .withMessage("Invalid Email format"),
  ],
  Controller.SendSigninOTP,
);

// Verify verification otp for email for signin (dependent on triedLogin variable)
UserAuthRouter.post(
  "/signin/verify-otp",
  [
    body("email", "Email is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isEmail()
      .normalizeEmail({ all_lowercase: true })
      .withMessage("Invalid Email format"),

    body("verificationCode", "Verification code is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim(),
  ],
  Controller.VerifySigninOTP,
);

// Resend OTP for email verification for signin (dependent on triedLogin variable)
UserAuthRouter.post(
  "/signin/resend-otp",
  [
    body("email", "Email is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isEmail()
      .normalizeEmail({ all_lowercase: true })
      .withMessage("Invalid Email format"),
  ],
  Controller.ResendSigninOTP,
);

// Reset password with email
UserAuthRouter.post(
  "/reset-password",
  [
    body("email", "Email is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isEmail()
      .normalizeEmail({ all_lowercase: true })
      .withMessage("Invalid Email format"),
  ],
  Controller.ResetPassword,
);

// Resend OTP for password reset (dependent on triedPasswordReset variable)
UserAuthRouter.post(
  "/reset-password/resend-otp",
  [
    body("email", "Email is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isEmail()
      .normalizeEmail({ all_lowercase: true })
      .withMessage("Invalid Email format"),
  ],
  Controller.ResendResetPasswordOTP,
);

// Update password during reset (dependent on triedPasswordReset variable)
UserAuthRouter.post(
  "/reset-password/update",
  [
    body("email", "Email is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isEmail()
      .normalizeEmail({ all_lowercase: true })
      .withMessage("Invalid Email format"),

    body("newPassword", "New password is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number")
      .matches(/[!@#$%^&*]/)
      .withMessage(
        "Password must contain at least one special character (!@#$%^&*)",
      ),
    body("verificationCode", "Verification code is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim(),
  ],
  Controller.ResetPasswordUpdate,
);

// Sign in and sign up with google (automatic verification of email)
UserAuthRouter.post("/google", Controller.GoogleAuth);

//Google Login callback
UserAuthRouter.post(
  "/google/callback",
  body("code", "OAuth Code is required").exists({
    checkFalsy: true,
    checkNull: true,
  }),
  Controller.GoogleOAuthCallback,
);

// Poll for async job result
UserAuthRouter.get("/job-result/:token", Controller.GetJobResult);

// Get user sessions
UserAuthRouter.get("/sessions", isUserOrOrganization, Controller.GetSessions);

// Get specific user session
UserAuthRouter.get(
  "/session/:sessionId",
  isUserOrOrganization,
  [
    param("sessionId", "Session ID is required").exists({
      checkFalsy: true,
      checkNull: true,
    }),
  ],
  Controller.GetSession,
);

// Delete all other user sessions
UserAuthRouter.delete(
  "/sessions/others",
  isUserOrOrganization,
  Controller.DeleteAllOtherSessions,
);

// Delete specific user session
UserAuthRouter.delete(
  "/session/:sessionId",
  isUserOrOrganization,
  [
    param("sessionId", "Session ID is required").exists({
      checkFalsy: true,
      checkNull: true,
    }),
  ],
  Controller.DeleteSession,
);

UserAuthRouter.post("/logout", isUserOrOrganization, Controller.Logout);

export default UserAuthRouter;
