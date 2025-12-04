import { Router } from "express";
import { UserAuthController } from "../../controllers/user/auth";

const UserAuthRouter = Router();
const Controller = UserAuthController();

// Sign up as organization

// Sign up as individual

// Send Email verification OTP for signup

// Verify verification otp for email for sign up

// Resend OTP for email for sign up

// Sign in with email with 2fa required. Set triedLogin variable to ensure that 2fa verification can only work within the timing of that variable being true (5 mins)

// Send Email verification OTP for signin (dependent on triedLogin variable)

// Verify verification otp for email for signin (dependent on triedLogin variable)

// Resend OTP for email verification for signin (dependent on triedLogin variable)

// Reset password with email

// Update password during reset (dependent on triedPasswordReset variable)

// Sign in and sign up with google (automatic verification of email)

// Logout

// Get user sessions

// Delete all other user sessions

// Delete specific user session

export default UserAuthRouter;
