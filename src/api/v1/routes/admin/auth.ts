import { Router } from "express";
import { body } from "express-validator";
import { isAdmin } from "../../../../middleware/auth";
import { AdminAuthController } from "../../controllers/admin/auth";

const AdminAuthRouter = Router();
const Controller = AdminAuthController();

// Login
AdminAuthRouter.post(
  "/login",
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
  Controller.Login,
);

// Logout
AdminAuthRouter.post("/logout", isAdmin, Controller.Logout);

// Verify OTP
AdminAuthRouter.post(
  "/verify-otp",
  [
    body("email", "Email is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isEmail()
      .normalizeEmail({ all_lowercase: true })
      .withMessage("Invalid Email format"),
    body("otp", "OTP is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be 6 digits"),
  ],
  Controller.VerifyOTP,
);

// Resend OTP
AdminAuthRouter.post(
  "/resend-otp",
  [
    body("email", "Email is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isEmail()
      .normalizeEmail({ all_lowercase: true })
      .withMessage("Invalid Email format"),
  ],
  Controller.ResendOTP,
);

// Request Password Reset
AdminAuthRouter.post(
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

// Reset Password Update
AdminAuthRouter.post(
  "/reset-password/update",
  [
    body("email", "Email is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isEmail()
      .normalizeEmail({ all_lowercase: true })
      .withMessage("Invalid Email format"),
    body("otp", "OTP is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be 6 digits"),
    body("newPassword", "New password is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
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
  Controller.ResetPasswordUpdate,
);

// Change Password (in settings)
AdminAuthRouter.post(
  "/change-password",
  [
    isAdmin,
    body("currentPassword", "Current password is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim(),
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
      )
      // New password should be different from current password
      .custom((value, { req }) => {
        if (value === req.body.currentPassword) {
          throw new Error(
            "New password must be different from current password",
          );
        }
        return true;
      }),
  ],
  Controller.ChangePassword,
);

// Get Admin Profile
AdminAuthRouter.get("/profile", [isAdmin], Controller.GetProfile);

// Update Admin Profile
AdminAuthRouter.put(
  "/profile",
  [
    body("firstName", "First name is required")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("First name must be at least 2 characters long"),
    body("lastName", "Last name is required")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Last name must be at least 2 characters long"),
    body("phoneNumber", "Phone number is required")
      .optional()
      .trim()
      .isMobilePhone("any", { strictMode: true })
      .withMessage("Invalid phone number format"),
  ],
  Controller.UpdateProfile,
);

export default AdminAuthRouter;
