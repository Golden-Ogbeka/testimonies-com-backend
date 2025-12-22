import { Router } from "express";
import { param } from "express-validator";
import { isValidObjectId } from "../../../../middleware/validation";
import { UserProfileController } from "../../controllers/user/profile";

const UserProfileRouter = Router();
const Controller = UserProfileController();

// Get logged in user's profile details
UserProfileRouter.get("/", Controller.GetProfile);

// Update logged in user's profile details
UserProfileRouter.put("/", Controller.UpdateProfile);

// Delete logged in user's profile
UserProfileRouter.delete("/", Controller.DeleteProfile);

// Update logged in user's profile picture
UserProfileRouter.patch("/picture", Controller.UpdateProfilePicture);

// Update logged in user's profile cover photo
UserProfileRouter.patch("/cover", Controller.UpdateCoverPhoto);

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
UserProfileRouter.get("/share-url/:username", Controller.GetProfileShareUrlByUsername);

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
