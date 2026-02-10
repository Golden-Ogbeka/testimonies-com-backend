import { Router } from "express";
import { body, param, query } from "express-validator";
import { isValidObjectId } from "../../../../middleware/validation";
import { AdminUserController } from "../../controllers/admin/user";

const AdminUserRouter = Router();
const Controller = AdminUserController();

// Get all users
AdminUserRouter.get(
  "/",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("isActive", "isActive must be boolean").optional().isBoolean(),
    query("isFlagged", "isFlagged must be boolean").optional().isBoolean(),
    query("accountType", "Account type is required")
      .optional()
      .isIn(["individual", "organization"]),
    query("subscriptionType", "Subscription type is required")
      .optional()
      .isIn(["basic", "premium", "enterprise"]),
  ],
  Controller.GetAllUsers,
);

// Get user by ID
AdminUserRouter.get(
  "/details/:id",
  param("id", "User ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetSingleUser,
);

// Update user details
AdminUserRouter.patch(
  "/:id",
  [
    param("id", "User ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
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
    body("email", "Email is required")
      .optional()
      .isEmail()
      .withMessage("Please provide a valid email"),
    body("phoneNumber", "Phone number is required")
      .optional()
      .isMobilePhone()
      .withMessage("Please provide a valid phone number"),
    body("profileImage", "Profile image is required")
      .optional()
      .isURL()
      .withMessage("Please provide a valid URL"),
    body("bio", "Bio is required")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Bio must not exceed 500 characters"),
    body("profileVisibility", "Profile visibility is required")
      .optional()
      .isIn(["public", "private", "friends_only"]),
    body("isFlagged", "isFlagged must be boolean").optional().isBoolean(),
  ],
  Controller.UpdateUser,
);

// Deactivate user account
AdminUserRouter.post(
  "/deactivate/:id",
  param("id", "User ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.DeactivateUser,
);

// Activate user account
AdminUserRouter.post(
  "/activate/:id",
  param("id", "User ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.ActivateUser,
);

// Get user kyc applications
AdminUserRouter.get(
  "/kyc",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("status", "KYC status is required")
      .optional()
      .isIn(["pending", "approved", "rejected"]),
  ],
  Controller.GetAllUserKYCApplications,
);

// Get user kyc application by ID
AdminUserRouter.get(
  "/kyc/details/:id",
  param("id", "KYC ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetUserKYCApplication,
);

// Approve user kyc application
AdminUserRouter.post(
  "/kyc/approve/:id",
  [
    param("id", "KYC ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
    body("adminId", "Admin ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.ApproveUserKYCApplication,
);

// Reject user kyc application
AdminUserRouter.post(
  "/kyc/reject/:id",
  [
    param("id", "KYC ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
    body("adminId", "Admin ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
    body("reason", "Rejection reason is required")
      .optional()
      .trim()
      .isLength({ min: 5 })
      .withMessage("Rejection reason must be at least 5 characters long"),
  ],
  Controller.RejectUserKYCApplication,
);

// Get users' profile statistics (such as number of testimonies submitted, average ratings, etc.)
AdminUserRouter.get(
  "/profile-stats",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
  Controller.GetAllUsersProfileStats,
);

// Get profile statistics of a particular user by ID
AdminUserRouter.get(
  "/profile-stats/user/:id",
  param("id", "User ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetUserProfileStats,
);

// Get user message statistics (such as number of messages sent, received, etc.)
AdminUserRouter.get(
  "/message-stats",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
  Controller.GetAllUserMessageStats,
);

// Get message statistics of a particular user by ID
AdminUserRouter.get(
  "/message-stats/user/:id",
  param("id", "User ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetUserMessageStats,
);

export default AdminUserRouter;
