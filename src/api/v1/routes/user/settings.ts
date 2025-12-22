import { Router } from "express";
import { UserSettingsController } from "../../controllers/user/settings";

const UserSettingsRouter = Router();
const Controller = UserSettingsController();

// Update user's profile visibility settings
UserSettingsRouter.patch("/visibility", Controller.UpdateVisibilitySettings);

// Update user's notification settings
UserSettingsRouter.patch("/notifications", Controller.UpdateNotificationSettings);

// Update user's privacy settings
UserSettingsRouter.patch("/privacy", Controller.UpdatePrivacySettings);

// Update user's password
UserSettingsRouter.patch("/password", Controller.UpdatePassword);

// Enable two-factor authentication (2FA) for user
UserSettingsRouter.post("/2fa/enable", Controller.Enable2FA);

// Disable two-factor authentication (2FA) for user
UserSettingsRouter.post("/2fa/disable", Controller.Disable2FA);

// Update user's message settings
UserSettingsRouter.patch("/messages", Controller.UpdateMessageSettings);

export default UserSettingsRouter;
