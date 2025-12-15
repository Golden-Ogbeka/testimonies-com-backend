import { Router } from "express";
import { AdminAuthController } from "../../controllers/admin/auth";

const AdminAuthRouter = Router();
const Controller = AdminAuthController();

// Login
AdminAuthRouter.post("/login", Controller.Login);

// Logout
AdminAuthRouter.post("/logout", Controller.Logout);

// Verify OTP
AdminAuthRouter.post("/verify-otp", Controller.VerifyOTP);

// Resend OTP
AdminAuthRouter.post("/resend-otp", Controller.ResendOTP);

// Request Password Reset
AdminAuthRouter.post("/reset-password", Controller.ResetPassword);

// Reset Password Update
AdminAuthRouter.post("/reset-password/update", Controller.ResetPasswordUpdate);

// Change Password (in settings)
AdminAuthRouter.post("/change-password", Controller.ChangePassword);

// Get Admin Profile
AdminAuthRouter.get("/profile", Controller.GetProfile);

// Update Admin Profile
AdminAuthRouter.put("/profile", Controller.UpdateProfile);

export default AdminAuthRouter;
