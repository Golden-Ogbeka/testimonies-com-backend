import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  isOrganization,
  isUser,
  isUserOrOrganization,
} from "../../../../middleware/auth";
import { isValidObjectId } from "../../../../middleware/validation";
import { imageParser } from "../../../../utils/cloudinary";
import { UserProfileController } from "../../controllers/user/profile";

const UserProfileRouter = Router();
const Controller = UserProfileController();

// Get logged in user's profile details
UserProfileRouter.get("/", isUserOrOrganization, Controller.GetProfile);

// Update logged in user's profile details
UserProfileRouter.patch(
  "/user",
  [
    isUser,
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
    body("bio")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Bio must be at least 2 characters long"),
    body("address")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Address must be at least 2 characters long"),
  ],
  Controller.UpdateProfile,
);

// Update user's email
UserProfileRouter.patch(
  "/email",
  [
    isUserOrOrganization,
    body("email", "Email is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail({ all_lowercase: true })
      .isLength({ max: 100 })
      .withMessage("Email cannot have more than 100 characters."),
  ],
  Controller.UpdateUserEmail,
);

// Resend email verification OTP
UserProfileRouter.post(
  "/email/resend-otp",
  [isUserOrOrganization],
  Controller.ResendUpdateEmailOTP,
);

// Verify email verification OTP
UserProfileRouter.post(
  "/email/verify-otp",
  [
    isUserOrOrganization,
    body("verificationCode", "Verification code is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim(),
  ],
  Controller.VerifyUpdateEmail,
);

// Update user's username
UserProfileRouter.patch(
  "/username",
  [
    isUserOrOrganization,
    body("username", "Username is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long"),
  ],
  Controller.UpdateUserUsername,
);

// Update user's phone number
UserProfileRouter.patch(
  "/phone",
  [
    isUserOrOrganization,
    body("phoneNumber", "Phone number is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isMobilePhone("any", { strictMode: true })
      .withMessage(
        "Invalid mobile number. Please, make sure to add the preceding country or city code.",
      ),
  ],
  Controller.UpdateUserPhoneNumber,
);

// Update logged in organization's profile details
UserProfileRouter.patch(
  "/organization",
  [
    isOrganization,
    body("businessName", "Business name is required")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Business name must be at least 2 characters long"),

    body("businessAddress", "Business address is required")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Business address must be at least 2 characters long"),
    body("businessWebsite")
      .optional()
      .isURL()
      .withMessage("Business website must be a valid URL"),
    body("businessBio")
      .optional()
      .isLength({ min: 2 })
      .withMessage("Business bio must be at least 2 characters long"),
  ],
  Controller.UpdateOrganizationProfile,
);

// Update user's password
UserProfileRouter.patch(
  "/password",
  [
    isUserOrOrganization,
    body("oldPassword", "Old password is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .withMessage("Old password is required to update password"),
    body("newPassword", "New password is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters long")
      .matches(/[A-Z]/)
      .withMessage("New password must contain at least one uppercase letter")
      .matches(/[a-z]/)
      .withMessage("New password must contain at least one lowercase letter")
      .matches(/[0-9]/)
      .withMessage("New password must contain at least one number")
      .matches(/[!@#$%^&*]/)
      .withMessage(
        "New password must contain at least one special character (!@#$%^&*)",
      )
      .custom((value, { req }) => {
        if (value === req.body.oldPassword) {
          throw new Error("New password cannot be the same as old password");
        } else {
          return true;
        }
      }),
    body("confirmNewPassword", "Confirm new password is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error("New passwords do not match");
        } else {
          return true;
        }
      }),
  ],
  Controller.UpdatePassword,
);

// Delete logged in user's profile
UserProfileRouter.delete(
  "/",
  [
    isUserOrOrganization,
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
  Controller.DeleteProfile,
);

// Update logged in user's profile picture
UserProfileRouter.patch(
  "/picture",
  [isUserOrOrganization, imageParser.single("profilePhoto")],
  Controller.UpdateProfilePicture,
);

// Update logged in user's profile cover photo
UserProfileRouter.patch(
  "/cover-picture",
  [isUserOrOrganization, imageParser.single("coverImage")],
  Controller.UpdateCoverPhoto,
);

// ⚠️ PUBLIC ENDPOINT
// Get another user's public profile by username
UserProfileRouter.get(
  "/username",
  [
    query("username", "Username is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 2 })
      .withMessage("Username must be at least 2 characters long"),
  ],
  Controller.GetProfileByUsername,
);

// Get another user's profile by user id
UserProfileRouter.get(
  "/find-by-id/:id",
  [
    isUserOrOrganization,
    param("id", "User ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.GetProfileById,
);

// Search users by name or username
UserProfileRouter.get(
  "/search-users",
  [
    isUserOrOrganization,
    query("name", "Name is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters long"),
  ],
  Controller.SearchUsers,
);

// Follow a user
UserProfileRouter.post(
  "/follow/:id",
  [
    isUserOrOrganization,
    param("id", "User ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.FollowUser,
);

// Unfollow a user
UserProfileRouter.delete(
  "/unfollow/:id",
  [
    isUserOrOrganization,
    param("id", "User ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.UnfollowUser,
);

// Get followers of a user. This would also serve for logged in user. Pass that user's id
UserProfileRouter.get(
  "/followers/:id",
  [
    isUserOrOrganization,
    param("id", "User ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
    query("followingUserId")
      .optional()
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.GetFollowers,
);

// Get following of a user. This would also serve for logged in user. Pass that user's id
UserProfileRouter.get(
  "/following/:id",
  [
    isUserOrOrganization,
    param("id", "User ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
    query("leadingUserId")
      .optional()
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.GetFollowing,
);

// View follow requests
UserProfileRouter.get(
  "/follow-requests",
  isUserOrOrganization,
  Controller.ViewFollowRequests,
);

// Accept follow request
UserProfileRouter.post(
  "/follow-requests/:id/accept",
  [
    isUserOrOrganization,
    param("id", "Follow Request ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.AcceptFollowRequest,
);

// Reject follow request
UserProfileRouter.post(
  "/follow-requests/:id/reject",
  [
    isUserOrOrganization,
    param("id", "Follow Request ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.RejectFollowRequest,
);

// Block a user
UserProfileRouter.post(
  "/block/:id",
  [
    isUserOrOrganization,
    // This is the ID of the user that is to be blocked
    param("id", "User ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.BlockUser,
);

// Unblock a user
UserProfileRouter.delete(
  "/block/:id",
  [
    isUserOrOrganization,
    // This is the ID of the user that is to be unblocked
    param("id", "User ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.UnblockUser,
);

// Get blocked users
UserProfileRouter.get(
  "/blocked",
  [
    isUserOrOrganization,
    query("blockedUserId")
      .optional()
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.GetBlockedUsers,
);

// Get logged in user's profile share url
UserProfileRouter.get(
  "/share-url",
  isUserOrOrganization,
  Controller.GetProfileShareUrl,
);

// Get another user's profile share url by username
UserProfileRouter.get(
  "/share-url/:username",
  isUserOrOrganization,
  Controller.GetProfileShareUrlByUsername,
);

// Update user's profile visibility
UserProfileRouter.patch(
  "/visibility",
  [
    isUserOrOrganization,
    body("profileVisibility", "Profile visibility is required")
      .exists({ checkFalsy: true, checkNull: true })
      .isIn(["public", "private", "secret"])
      .withMessage("Invalid profile visibility option"),
  ],
  Controller.UpdateProfileVisibility,
);

// // Get user's kyc status
// UserProfileRouter.get("/kyc/status", Controller.GetKYCStatus);

// // Upload user's kyc documents
// UserProfileRouter.post("/kyc/upload", Controller.UploadKYCDocuments);

// // Submit user's kyc application
// UserProfileRouter.post("/kyc/submit", Controller.SubmitKYCApplication);

// // Get user's kyc application history
// UserProfileRouter.get("/kyc/history", Controller.GetKYCHistory);

// // Get user's kyc application by id which includes status and admin feedback
// UserProfileRouter.get(
//   "/kyc/:id",
//   param("id", "KYC ID is required")
//     .exists({ checkFalsy: true, checkNull: true })
//     .custom((value) => isValidObjectId(value)),
//   Controller.GetKYCApplication,
// );

// // Delete user's kyc application by id
// UserProfileRouter.delete(
//   "/kyc/:id",
//   param("id", "KYC ID is required")
//     .exists({ checkFalsy: true, checkNull: true })
//     .custom((value) => isValidObjectId(value)),
//   Controller.DeleteKYCApplication,
// );

export default UserProfileRouter;
