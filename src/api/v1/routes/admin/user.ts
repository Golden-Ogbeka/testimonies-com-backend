import { Router } from "express";
import { param } from "express-validator";
import { isValidObjectId } from "../../../../middleware/validation";
import { AdminUserController } from "../../controllers/admin/user";

const AdminUserRouter = Router();
const Controller = AdminUserController();

// Get all users
AdminUserRouter.get("/", Controller.GetAllUsers);

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
  param("id", "User ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
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
AdminUserRouter.get("/kyc", Controller.GetAllUserKYCApplications);

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
  param("id", "KYC ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.ApproveUserKYCApplication,
);

// Reject user kyc application
AdminUserRouter.post(
  "/kyc/reject/:id",
  param("id", "KYC ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.RejectUserKYCApplication,
);

// Get users' profile statistics (such as number of testimonies submitted, average ratings, etc.)
AdminUserRouter.get("/profile-stats", Controller.GetAllUsersProfileStats);

// Get profile statistics of a particular user by ID
AdminUserRouter.get(
  "/profile-stats/user/:id",
  param("id", "User ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetUserProfileStats,
);

// Get user message statistics (such as number of messages sent, received, etc.)
AdminUserRouter.get("/message-stats", Controller.GetAllUserMessageStats);

// Get message statistics of a particular user by ID
AdminUserRouter.get(
  "/message-stats/user/:id",
  param("id", "User ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetUserMessageStats,
);

export default AdminUserRouter;
