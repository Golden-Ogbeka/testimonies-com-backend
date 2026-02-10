import { Router } from "express";
import { body, param, query } from "express-validator";
import { isValidObjectId } from "../../../../middleware/validation";
import { AdminDataManagementController } from "../../controllers/admin/data-management";

const AdminDataManagementRouter = Router();
const Controller = AdminDataManagementController();

// Add FAQ
AdminDataManagementRouter.post(
  "/faq",
  [
    body("question", "Question is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 5 })
      .withMessage("Question must be at least 5 characters long"),
    body("answer", "Answer is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 10 })
      .withMessage("Answer must be at least 10 characters long"),
    body("category", "Category is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim(),
    body("order", "Order must be a number").optional().isNumeric(),
  ],
  Controller.AddFAQ,
);

// Update FAQ
AdminDataManagementRouter.put(
  "/faq/:id",
  [
    param("id", "FAQ ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
    body("question", "Question is required")
      .optional()
      .trim()
      .isLength({ min: 5 })
      .withMessage("Question must be at least 5 characters long"),
    body("answer", "Answer is required")
      .optional()
      .trim()
      .isLength({ min: 10 })
      .withMessage("Answer must be at least 10 characters long"),
    body("category", "Category is required").optional().trim(),
    body("order", "Order must be a number").optional().isNumeric(),
    body("isActive", "isActive must be boolean").optional().isBoolean(),
  ],
  Controller.UpdateFAQ,
);

// Delete FAQ
AdminDataManagementRouter.delete(
  "/faq/:id",
  param("id", "FAQ ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.DeleteFAQ,
);

// Get All FAQs
AdminDataManagementRouter.get(
  "/faq",
  [
    query("page", "Page must be a number").optional().isNumeric(),
    query("limit", "Limit must be a number").optional().isNumeric(),
    query("category", "Category is required").optional().trim(),
    query("isActive", "isActive must be boolean").optional().isBoolean(),
  ],
  Controller.GetAllFAQs,
);

// Get Single FAQ
AdminDataManagementRouter.get(
  "/faq/details/:id",
  param("id", "FAQ ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetSingleFAQ,
);

// Get Privacy Policy
AdminDataManagementRouter.get("/privacy-policy", Controller.GetPrivacyPolicy);

// Get Terms of Service
AdminDataManagementRouter.get(
  "/terms-of-service",
  Controller.GetTermsOfService,
);

// Get Community Guidelines
AdminDataManagementRouter.get(
  "/community-guidelines",
  Controller.GetCommunityGuidelines,
);

// Update Privacy Policy
AdminDataManagementRouter.put(
  "/privacy-policy",
  [
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
    body("version", "Version is required").optional().trim(),
  ],
  Controller.UpdatePrivacyPolicy,
);

// Update Terms of Service
AdminDataManagementRouter.put(
  "/terms-of-service",
  [
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
    body("version", "Version is required").optional().trim(),
  ],
  Controller.UpdateTermsOfService,
);

// Update Community Guidelines
AdminDataManagementRouter.put(
  "/community-guidelines",
  [
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
    body("version", "Version is required").optional().trim(),
  ],
  Controller.UpdateCommunityGuidelines,
);

// Create organizations' team member permissions
AdminDataManagementRouter.post(
  "/team-permissions",
  [
    body("teamName", "Team name is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 2 })
      .withMessage("Team name must be at least 2 characters long"),
    body("permissions", "Permissions are required")
      .exists({ checkFalsy: true, checkNull: true })
      .isArray()
      .withMessage("Permissions must be an array"),
    body("description", "Description is required").optional().trim(),
  ],
  Controller.CreateTeamPermissions,
);

// Update organizations' team member permissions
AdminDataManagementRouter.put(
  "/team-permissions/:id",
  [
    param("id", "Team Permission ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
    body("teamName", "Team name is required")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Team name must be at least 2 characters long"),
    body("permissions", "Permissions are required")
      .optional()
      .isArray()
      .withMessage("Permissions must be an array"),
    body("description", "Description is required").optional().trim(),
  ],
  Controller.UpdateTeamPermissions,
);

// Delete organizations' team member permissions
AdminDataManagementRouter.delete(
  "/team-permissions/:id",
  param("id", "Team Permission ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.DeleteTeamPermissions,
);

// Get organizations' team member permissions
AdminDataManagementRouter.get(
  "/team-permissions",
  [
    query("page", "Page must be a number").optional().isNumeric(),
    query("limit", "Limit must be a number").optional().isNumeric(),
  ],
  Controller.GetAllTeamPermissions,
);

// Get single organization team member permissions by ID
AdminDataManagementRouter.get(
  "/team-permissions/details/:id",
  param("id", "Team Permission ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetSingleTeamPermission,
);

export default AdminDataManagementRouter;
