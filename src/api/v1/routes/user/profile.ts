import { Router } from "express";
import { body, param } from "express-validator";
import {
  isOrganization,
  isUser,
  isUserOrOrganization,
} from "../../../../middleware/auth";
import { isBusinessEmail } from "../../../../middleware/field-check";
import { isValidObjectId } from "../../../../middleware/validation";
import { parser } from "../../../../utils/cloudinary";
import { UserProfileController } from "../../controllers/user/profile";

const UserProfileRouter = Router();
const Controller = UserProfileController();

// Get logged in user's profile details
UserProfileRouter.get("/", Controller.GetProfile);

// Update logged in user's profile details
UserProfileRouter.put(
  "/user",
  [
    isUser,
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
    body("bio")
      .optional()
      .isLength({ min: 2 })
      .withMessage("Bio must be at least 2 characters long"),
    body("address")
      .optional()
      .isLength({ min: 2 })
      .withMessage("Address must be at least 2 characters long"),
  ],
  Controller.UpdateProfile,
);

// Update logged in organization's profile details
UserProfileRouter.put(
  "/organization",
  [
    isOrganization,
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
    body("businessLocationGeographicCoordinates")
      .isArray({ min: 2, max: 2 })
      .withMessage(
        "Business geographic coordinates must be an array of two numbers [longitude, latitude]",
      )
      .custom((value) => {
        if (
          typeof value[0] !== "number" ||
          typeof value[1] !== "number" ||
          value[0] < -180 ||
          value[0] > 180 ||
          value[1] < -90 ||
          value[1] > 90
        ) {
          throw new Error(
            "Business geographic coordinates must be valid longitude and latitude values",
          );
        } else {
          return true;
        }
      }),
    body("businessWebsite")
      .optional()
      .isURL()
      .withMessage("Business website must be a valid URL"),
    body("businessBio")
      .optional()
      .isLength({ min: 2 })
      .withMessage("Business bio must be at least 2 characters long"),
  ],
  Controller.UpdateProfile,
);

// Delete logged in user's profile
UserProfileRouter.delete("/", Controller.DeleteProfile);

// Update logged in user's profile picture
UserProfileRouter.patch(
  "/picture",
  [isUserOrOrganization, parser.single("profilePhoto")],
  Controller.UpdateProfilePicture,
);

// Update logged in user's profile cover photo
UserProfileRouter.patch(
  "/cover",
  [isUserOrOrganization, parser.single("coverImage")],
  Controller.UpdateCoverPhoto,
);

// Get another user's public profile by username
UserProfileRouter.get("/username/:username", Controller.GetProfileByUsername);

// Get another user's profile by user id
UserProfileRouter.get(
  "/user/:id",
  param("id", "User ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetProfileById,
);

// Search users by name or username
UserProfileRouter.get("/search", Controller.SearchUsers);

// Follow a user
UserProfileRouter.post(
  "/follow/:id",
  param("id", "User ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.FollowUser,
);

// Unfollow a user
UserProfileRouter.delete(
  "/follow/:id",
  param("id", "User ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.UnfollowUser,
);

// Block a user
UserProfileRouter.post(
  "/block/:id",
  param("id", "User ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.BlockUser,
);

// Unblock a user
UserProfileRouter.delete(
  "/block/:id",
  param("id", "User ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.UnblockUser,
);

// Get followers of a user
UserProfileRouter.get(
  "/followers/:id",
  param("id", "User ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetFollowers,
);

// Get following of a user
UserProfileRouter.get(
  "/following/:id",
  param("id", "User ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetFollowing,
);

// Get blocked users
UserProfileRouter.get("/blocked", Controller.GetBlockedUsers);

// Get whether logged in user follows another user
UserProfileRouter.get(
  "/follows/:id",
  param("id", "User ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.CheckFollowStatus,
);

// Get whether logged in user has blocked another user
UserProfileRouter.get(
  "/blocked/:id",
  param("id", "User ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.CheckBlockStatus,
);

// Get logged in user's profile share url
UserProfileRouter.get("/share-url", Controller.GetProfileShareUrl);

// Get another user's profile share url by username
UserProfileRouter.get(
  "/share-url/:username",
  Controller.GetProfileShareUrlByUsername,
);

// Get user profile statistics (number of followers, following, testimonies, replies, likes received, views received)
UserProfileRouter.get("/stats", Controller.GetProfileStats);

// View broadcast testimony requests
UserProfileRouter.get("/broadcast-requests", Controller.GetBroadcastRequests);

// View broadcast testimony request by id
UserProfileRouter.get(
  "/broadcast-requests/:id",
  param("id", "Request ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetBroadcastRequest,
);

// Approve broadcast testimony request
UserProfileRouter.post(
  "/broadcast-requests/:id/approve",
  param("id", "Request ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.ApproveBroadcastRequest,
);

// Reject broadcast testimony request
UserProfileRouter.post(
  "/broadcast-requests/:id/reject",
  param("id", "Request ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.RejectBroadcastRequest,
);

// Get user's kyc status
UserProfileRouter.get("/kyc/status", Controller.GetKYCStatus);

// Upload user's kyc documents
UserProfileRouter.post("/kyc/upload", Controller.UploadKYCDocuments);

// Submit user's kyc application
UserProfileRouter.post("/kyc/submit", Controller.SubmitKYCApplication);

// Get user's kyc application history
UserProfileRouter.get("/kyc/history", Controller.GetKYCHistory);

// Get user's kyc application by id which includes status and admin feedback
UserProfileRouter.get(
  "/kyc/:id",
  param("id", "KYC ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetKYCApplication,
);

// Delete user's kyc application by id
UserProfileRouter.delete(
  "/kyc/:id",
  param("id", "KYC ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.DeleteKYCApplication,
);

export default UserProfileRouter;
