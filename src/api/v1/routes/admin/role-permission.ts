import { Router } from "express";
import { body, param, query } from "express-validator";
import { isAdmin, isSuperAdmin } from "../../../../middleware/auth";
import { isValidObjectId } from "../../../../middleware/validation";
import { AdminRolePermissionController } from "../../controllers/admin/role-permission";

const AdminRolePermissionRouter = Router();
const Controller = AdminRolePermissionController();

// Get all permissions
AdminRolePermissionRouter.get(
  "/permission",
  [
    isAdmin,
    query("page", "Page must be a number").optional().isNumeric(),
    query("limit", "Limit must be a number").optional().isNumeric(),
  ],
  Controller.GetAllPermissions,
);

// Get single permission
AdminRolePermissionRouter.get(
  "/permission/:id",
  [
    isAdmin,
    param("id", "Permission ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.GetSinglePermission as any,
);

// Create permission
AdminRolePermissionRouter.post(
  "/permission",
  [
    isSuperAdmin,
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
  ],
  Controller.CreatePermission,
);

// Update permission
AdminRolePermissionRouter.put(
  "/permission/:id",
  [
    isSuperAdmin,
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
  ],
  Controller.UpdatePermission as any,
);

// Delete permission
AdminRolePermissionRouter.delete(
  "/permission/:id",
  [
    isSuperAdmin,
    param("id", "Permission ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.DeletePermission as any,
);

// Create admin
AdminRolePermissionRouter.post(
  "/admin",
  [
    isSuperAdmin,
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
      .isMobilePhone("any")
      .withMessage("Please provide a valid phone number"),
    body("role", "Role is required").optional().isIn(["super-admin", "admin"]),
    body("permissions", "Permissions must be an array").optional().isArray(),
  ],
  Controller.CreateAdmin,
);

// Update admin role
AdminRolePermissionRouter.post(
  "/admin/update-role/:id",
  [
    isSuperAdmin,
    param("id", "Admin ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
    body("role", "Role is required")
      .exists({ checkFalsy: true, checkNull: true })
      .isIn(["super-admin", "admin"]),
  ],
  Controller.UpdateAdminRole as any,
);

// Update admin permissions
AdminRolePermissionRouter.post(
  "/admin/update-permissions/:id",
  [
    isSuperAdmin,
    param("id", "Admin ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
    body("permissions", "Permissions must be an array")
      .exists({ checkFalsy: true, checkNull: true })
      .isArray(),
  ],
  Controller.UpdateAdminPermissions as any,
);

// Deactivate admin
AdminRolePermissionRouter.post(
  "/admin/deactivate/:id",
  [
    isSuperAdmin,
    param("id", "Admin ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.DeactivateAdmin as any,
);

// Reactivate admin
AdminRolePermissionRouter.post(
  "/admin/activate/:id",
  [
    isSuperAdmin,
    param("id", "Admin ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.ActivateAdmin as any,
);

// Get all admins
AdminRolePermissionRouter.get(
  "/admin",
  [
    isAdmin,
    query("page", "Page must be a number").optional().isNumeric(),
    query("limit", "Limit must be a number").optional().isNumeric(),
    query("role", "Role is required").optional().isIn(["super-admin", "admin"]),
    query("isActive", "isActive must be boolean").optional().isBoolean(),
  ],
  Controller.GetAllAdmins,
);

// Get admin by ID
AdminRolePermissionRouter.get(
  "/admin/details/:id",
  [
    isAdmin,
    param("id", "Admin ID is required")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((value) => isValidObjectId(value)),
  ],
  Controller.GetSingleAdmin as any,
);

// Update admin details by admin ID
AdminRolePermissionRouter.put(
  "/admin/:id",
  [
    isSuperAdmin,
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
      .isMobilePhone("any")
      .withMessage("Please provide a valid phone number"),
  ],
  Controller.UpdateAdmin as any,
);

export default AdminRolePermissionRouter;
