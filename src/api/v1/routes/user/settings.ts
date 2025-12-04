import { Router } from "express";
import { UserSettingsController } from "../../controllers/user/settings";

const UserSettingsRouter = Router();
const Controller = UserSettingsController();

// Update user's profile visibility settings

// Update user's notification settings

// Update user's privacy settings

// Update user's password

// Enable two-factor authentication (2FA) for user

// Disable two-factor authentication (2FA) for user

// Update user's message settings

export default UserSettingsRouter;
