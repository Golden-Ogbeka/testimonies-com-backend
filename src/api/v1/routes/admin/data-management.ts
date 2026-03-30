import { Router } from "express";
import { body, param, query } from "express-validator";
import { isAdmin } from "../../../../middleware/auth";
import { isValidObjectId } from "../../../../middleware/validation";
import { AdminDataManagementController } from "../../controllers/admin/data-management";

const AdminDataManagementRouter = Router();
const Controller = AdminDataManagementController();

// Get Privacy Policy
AdminDataManagementRouter.get(
  "/privacy-policy",
  isAdmin,
  Controller.GetPrivacyPolicy,
);

// Get Terms of Service
AdminDataManagementRouter.get(
  "/terms-of-service",
  isAdmin,
  Controller.GetTermsOfService,
);

// Get Community Guidelines
AdminDataManagementRouter.get(
  "/community-guidelines",
  isAdmin,
  Controller.GetCommunityGuidelines,
);

// Update Privacy Policy
AdminDataManagementRouter.put(
  "/privacy-policy",
  [
    isAdmin,
    body("title", "Title is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 3 })
      .withMessage("Title must be at least 3 characters long"),
    body("content", "Content is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 50 })
      .withMessage("Content must be at least 50 characters long"),
    body("version").optional().trim(),
  ],
  Controller.UpdatePrivacyPolicy,
);

// Update Terms of Service
AdminDataManagementRouter.put(
  "/terms-of-service",
  [
    isAdmin,
    body("title", "Title is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 3 })
      .withMessage("Title must be at least 3 characters long"),
    body("content", "Content is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 50 })
      .withMessage("Content must be at least 50 characters long"),
    body("version").optional().trim(),
  ],
  Controller.UpdateTermsOfService,
);

// Update Community Guidelines
AdminDataManagementRouter.put(
  "/community-guidelines",
  [
    isAdmin,
    body("title", "Title is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 3 })
      .withMessage("Title must be at least 3 characters long"),
    body("content", "Content is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 50 })
      .withMessage("Content must be at least 50 characters long"),
    body("version").optional().trim(),
  ],
  Controller.UpdateCommunityGuidelines,
);

// Create organizations' team permission
AdminDataManagementRouter.post(
  "/team-permission",
  [
    isAdmin,
    body("permission", "Permission name is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 2 })
      .withMessage("Permission name must be at least 2 characters long"),
    body("description", "Description is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 5 })
      .withMessage("Description must be at least 5 characters long"),
  ],
  Controller.CreateTeamPermission,
);

// Update organizations' team member permission
AdminDataManagementRouter.put(
  "/team-permission/:id",
  [
    isAdmin,
    param("id", "Team Permission ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
    body("permission")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Permission name must be at least 2 characters long"),
    body("description").optional().trim(),
  ],
  Controller.UpdateTeamPermission,
);

// Delete organizations' team member permission
AdminDataManagementRouter.delete(
  "/team-permission/:id",
  [
    isAdmin,
    param("id", "Team Permission ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.DeleteTeamPermission,
);

// Get organizations' team member permission
AdminDataManagementRouter.get(
  "/team-permission",
  [
    isAdmin,
    query("page", "Page must be a number").optional().isNumeric(),
    query("limit", "Limit must be a number").optional().isNumeric(),
  ],
  Controller.GetAllTeamPermissions,
);

// Get single organization team member permission by ID
AdminDataManagementRouter.get(
  "/team-permission/details/:id",
  [
    isAdmin,
    param("id", "Team Permission ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.GetSingleTeamPermission,
);

export default AdminDataManagementRouter;
