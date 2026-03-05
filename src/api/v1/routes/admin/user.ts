import { Router } from "express";
import { body, param, query } from "express-validator";
import { isAdmin, isSuperAdmin } from "../../../../middleware/auth";
import { isValidObjectId } from "../../../../middleware/validation";
import { AdminUserController } from "../../controllers/admin/user";

const AdminUserRouter = Router();
const Controller = AdminUserController();

// Get all users
AdminUserRouter.get(
  "/",
  [
    isAdmin,
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("isActive", "isActive must be boolean")
      .optional()
      .isBoolean()
      .toBoolean(),
    query("isFlagged", "isFlagged must be boolean")
      .optional()
      .isBoolean()
      .toBoolean(),
    query("accountType", "Account type is required")
      .optional()
      .isIn(["user", "organization"]),
    query("subscriptionType", "Subscription type is required")
      .optional()
      .isIn(["basic", "premium", "enterprise"]),
  ],
  Controller.GetAllUsers,
);

// Get user by ID
AdminUserRouter.get(
  "/details/:id",
  [
    isAdmin,
    param("id", "User ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.GetSingleUser,
);

// Update user details
AdminUserRouter.patch(
  "/:id",
  [
    isSuperAdmin,
    param("id", "User ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
    body("isFlagged", "isFlagged must be boolean")
      .optional()
      .isBoolean()
      .toBoolean(),
  ],
  Controller.UpdateUser,
);

// Deactivate user account
AdminUserRouter.post(
  "/deactivate/:id",
  [
    isSuperAdmin,
    param("id", "User ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.DeactivateUser,
);

// Activate user account
AdminUserRouter.post(
  "/activate/:id",
  [
    isSuperAdmin,
    param("id", "User ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.ActivateUser,
);

// Get users' profile statistics (such as number of testimonies submitted, average ratings, etc.)
AdminUserRouter.get(
  "/profile-stats",
  [
    isAdmin,
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
  [
    isAdmin,
    param("id", "User ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.GetUserProfileStats,
);

export default AdminUserRouter;
