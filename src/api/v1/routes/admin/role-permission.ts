import { Router } from "express";
import { body, param, query } from "express-validator";
import { isValidObjectId } from "../../../../middleware/validation";
import { AdminRolePermissionController } from "../../controllers/admin/role-permission";

const AdminRolePermissionRouter = Router();
const Controller = AdminRolePermissionController();

// Get all permissions
AdminRolePermissionRouter.get(
  "/permission",
  [
    query("page", "Page must be a number").optional().isNumeric(),
    query("limit", "Limit must be a number").optional().isNumeric(),
    query("resource", "Resource is required").optional().trim(),
    query("action", "Action is required").optional().trim(),
    query("isActive", "isActive must be boolean").optional().isBoolean(),
  ],
  Controller.GetAllPermissions,
);

// Get single permission
AdminRolePermissionRouter.get(
  "/permission/:id",
  param("id", "Permission ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetSinglePermission,
);

// Create permission
AdminRolePermissionRouter.post(
  "/permission",
  [
    body("name", "Permission name is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 2 })
      .withMessage("Permission name must be at least 2 characters long"),
    body("description", "Description is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 5 })
      .withMessage("Description must be at least 5 characters long"),
    body("resource", "Resource is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim(),
    body("action", "Action is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim(),
  ],
  Controller.CreatePermission,
);

// Update permission
AdminRolePermissionRouter.put(
  "/permission/:id",
  [
    param("id", "Permission ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
    body("name", "Permission name is required")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Permission name must be at least 2 characters long"),
    body("description", "Description is required")
      .optional()
      .trim()
      .isLength({ min: 5 })
      .withMessage("Description must be at least 5 characters long"),
    body("resource", "Resource is required").optional().trim(),
    body("action", "Action is required").optional().trim(),
    body("isActive", "isActive must be boolean").optional().isBoolean(),
  ],
  Controller.UpdatePermission,
);

// Delete permission
AdminRolePermissionRouter.delete(
  "/permission/:id",
  param("id", "Permission ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.DeletePermission,
);

// Create role
AdminRolePermissionRouter.post(
  "/role",
  [
    body("name", "Role name is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 2 })
      .withMessage("Role name must be at least 2 characters long"),
    body("description", "Description is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 5 })
      .withMessage("Description must be at least 5 characters long"),
    body("permissions", "Permissions must be an array").optional().isArray(),
    body("level", "Level must be a number").optional().isNumeric(),
  ],
  Controller.CreateRole,
);

// Get all roles
AdminRolePermissionRouter.get(
  "/role",
  [
    query("page", "Page must be a number").optional().isNumeric(),
    query("limit", "Limit must be a number").optional().isNumeric(),
    query("isActive", "isActive must be boolean").optional().isBoolean(),
  ],
  Controller.GetAllRoles,
);

// Get single role
AdminRolePermissionRouter.get(
  "/role/:id",
  param("id", "Role ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetSingleRole,
);

// Update role
AdminRolePermissionRouter.put(
  "/role/:id",
  [
    param("id", "Role ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
    body("name", "Role name is required")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Role name must be at least 2 characters long"),
    body("description", "Description is required")
      .optional()
      .trim()
      .isLength({ min: 5 })
      .withMessage("Description must be at least 5 characters long"),
    body("permissions", "Permissions must be an array").optional().isArray(),
    body("level", "Level must be a number").optional().isNumeric(),
    body("isActive", "isActive must be boolean").optional().isBoolean(),
  ],
  Controller.UpdateRole,
);

// Delete role
AdminRolePermissionRouter.delete(
  "/role/:id",
  param("id", "Role ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.DeleteRole,
);

// Assign permission to role
AdminRolePermissionRouter.post(
  "/assign-permission",
  [
    body("roleId", "Role ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
    body("permissionId", "Permission ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.AssignPermissionToRole,
);

// Remove permission from role
AdminRolePermissionRouter.post(
  "/remove-permission",
  [
    body("roleId", "Role ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
    body("permissionId", "Permission ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.RemovePermissionFromRole,
);

// Create admin
AdminRolePermissionRouter.post(
  "/admin",
  [
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
      .isEmail()
      .withMessage("Please provide a valid email"),
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
    body("phoneNumber", "Phone number is required")
      .optional()
      .isMobilePhone()
      .withMessage("Please provide a valid phone number"),
    body("role", "Role is required")
      .optional()
      .isIn(["super-admin", "admin", "moderator"]),
    body("permissions", "Permissions must be an array").optional().isArray(),
  ],
  Controller.CreateAdmin,
);

// Update admin role
AdminRolePermissionRouter.post(
  "/admin/update-role/:id",
  [
    param("id", "Admin ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
    body("role", "Role is required")
      .optional()
      .isIn(["super-admin", "admin", "moderator"]),
    body("permissions", "Permissions must be an array").optional().isArray(),
  ],
  Controller.UpdateAdminRole,
);

// Deactivate admin
AdminRolePermissionRouter.post(
  "/admin/deactivate/:id",
  param("id", "Admin ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.DeactivateAdmin,
);

// Reactivate admin
AdminRolePermissionRouter.post(
  "/admin/activate/:id",
  param("id", "Admin ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.ActivateAdmin,
);

// Get all admins
AdminRolePermissionRouter.get(
  "/admin",
  [
    query("page", "Page must be a number").optional().isNumeric(),
    query("limit", "Limit must be a number").optional().isNumeric(),
    query("role", "Role is required")
      .optional()
      .isIn(["super-admin", "admin", "moderator"]),
    query("isActive", "isActive must be boolean").optional().isBoolean(),
  ],
  Controller.GetAllAdmins,
);

// Get admin by ID
AdminRolePermissionRouter.get(
  "/admin/details/:id",
  param("id", "Admin ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetSingleAdmin,
);

// Update admin details by admin ID
AdminRolePermissionRouter.put(
  "/admin/:id",
  [
    param("id", "Admin ID is required")
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
    body("phoneNumber", "Phone number is required")
      .optional()
      .isMobilePhone()
      .withMessage("Please provide a valid phone number"),
    body("profileImage", "Profile image is required")
      .optional()
      .isURL()
      .withMessage("Please provide a valid URL"),
  ],
  Controller.UpdateAdmin,
);

export default AdminRolePermissionRouter;
