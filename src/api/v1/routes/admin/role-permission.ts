import { Router } from "express";
import { body, param } from "express-validator";
import { isValidObjectId } from "../../../../middleware/validation";
import { AdminRolePromotionController } from "../../controllers/admin/role-permission";

const AdminRolePermissionRouter = Router();
const Controller = AdminRolePromotionController();

// Get all permissions
AdminRolePermissionRouter.get("/permission", Controller.GetAllPermissions);

// Get single permission
AdminRolePermissionRouter.get(
  "/permission/:permissionID",
  param("permissionID", "Permission ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetSinglePermission,
);

// Create permission
AdminRolePermissionRouter.post("/permission", Controller.CreatePermission);

// Update permission
AdminRolePermissionRouter.put(
  "/permission/:permissionID",
  param("permissionID", "Permission ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.UpdatePermission,
);

// Delete permission
AdminRolePermissionRouter.delete(
  "/permission/:permissionID",
  param("permissionID", "Permission ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.DeletePermission,
);

// Create role
AdminRolePermissionRouter.post("/role", Controller.CreateRole);

// Get all roles
AdminRolePermissionRouter.get("/role", Controller.GetAllRoles);

// Get single role
AdminRolePermissionRouter.get(
  "/role/:roleID",
  param("roleID", "Role ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetSingleRole,
);

// Update role
AdminRolePermissionRouter.put(
  "/role/:roleID",
  param("roleID", "Role ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.UpdateRole,
);

// Delete role
AdminRolePermissionRouter.delete(
  "/role/:roleID",
  param("roleID", "Role ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.DeleteRole,
);

// Assign permission to role
AdminRolePermissionRouter.post(
  "/assign-permission",
  body("roleID", "Role ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  body("permissionID", "Permission ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.AssignPermissionToRole,
);

// Remove permission from role
AdminRolePermissionRouter.post(
  "/remove-permission",
  body("roleID", "Role ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  body("permissionID", "Permission ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.RemovePermissionFromRole,
);

// Create admin
AdminRolePermissionRouter.post("/admin", Controller.CreateAdmin);

// Update admin role
AdminRolePermissionRouter.post(
  "/admin/update-role/:adminId",
  param("adminId", "Admin ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.UpdateAdminRole,
);

// Deactivate admin
AdminRolePermissionRouter.post(
  "/admin/deactivate/:adminId",
  param("adminId", "Admin ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.DeactivateAdmin,
);

// Reactivate admin
AdminRolePermissionRouter.post(
  "/admin/activate/:adminId",
  param("adminId", "Admin ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.ActivateAdmin,
);

// Get all admins
AdminRolePermissionRouter.get("/admin", Controller.GetAllAdmins);

// Get admin by ID
AdminRolePermissionRouter.get(
  "/admin/details/:adminId",
  param("adminId", "Admin ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetSingleAdmin,
);

// Update admin details by admin ID
AdminRolePermissionRouter.put(
  "/admin/:adminId",
  param("adminId", "Admin ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.UpdateAdmin,
);

export default AdminRolePermissionRouter;
