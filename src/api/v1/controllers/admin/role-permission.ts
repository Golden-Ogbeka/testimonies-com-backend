import { Request, Response } from "express";
import { validationResult } from "express-validator";
import bcryptjs from "bcryptjs";
import {
  sendCatchFeedback,
  sendErrorFeedback,
  sendSuccessFeedback,
  sendValidationErrorFeedback,
} from "../../../../functions/feedback";
import AdminModel from "../../../../models/admin.model";
import PermissionModel from "../../../../models/permission.model";
import RoleModel from "../../../../models/role.model";
import { getPaginationOptions } from "../../../../utils/pagination";
import {
  IdParams,
  PermissionCreateRequestBody,
  PermissionUpdateRequestBody,
  RoleCreateRequestBody,
  RoleUpdateRequestBody,
  AssignPermissionRequestBody,
  AdminCreateRequestBody,
  AdminUpdateRequestBody,
  AdminProfileUpdateRequestBody,
  PaginationQuery,
  PermissionFilterQuery,
  RoleFilterQuery,
  AdminFilterQuery,
} from "../../../../types/requests";

export const AdminRolePermissionController = () => {
  const GetAllPermissions = async (
    req: Request<never, never, never, PermissionFilterQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const {
        page = 1,
        limit = 20,
        resource,
        action,
        isActive,
      } = req.query as any;

      // Build filter
      const filter: any = {};
      if (resource) filter.resource = resource;
      if (action) filter.action = action;
      if (isActive !== undefined) filter.isActive = isActive === "true";

      const paginationOptions = getPaginationOptions({
        page: page as string,
        limit: limit as string,
      });

      const permissions = await PermissionModel.paginate(filter, {
        ...paginationOptions,
        sort: { resource: 1, action: 1 },
      });

      return sendSuccessFeedback(res, "Permissions retrieved", {
        permissions: permissions.docs,
        pagination: {
          currentPage: permissions.page,
          totalPages: permissions.totalPages,
          totalDocs: permissions.totalDocs,
          hasNextPage: permissions.hasNextPage,
          hasPrevPage: permissions.hasPrevPage,
        },
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };
  const GetSinglePermission = async (req: Request<IdParams>, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const permission = await PermissionModel.findById(id);
      if (!permission) {
        return sendErrorFeedback(res, 404, "Permission not found");
      }

      return sendSuccessFeedback(res, "Permission retrieved", { permission });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const CreatePermission = async (
    req: Request<never, never, PermissionCreateRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { name, description, resource, action } = req.body;

      // Check if permission with same name already exists
      const existingPermission = await PermissionModel.findOne({ name });
      if (existingPermission) {
        return sendErrorFeedback(
          res,
          409,
          "Permission with this name already exists",
        );
      }

      const permission = await PermissionModel.create({
        name,
        description,
        resource,
        action,
      });

      return sendSuccessFeedback(res, "Permission created successfully", {
        permission,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const UpdatePermission = async (
    req: Request<IdParams, never, PermissionUpdateRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;
      const { name, description, resource, action, isActive } = req.body;

      const permission = await PermissionModel.findById(id);
      if (!permission) {
        return sendErrorFeedback(res, 404, "Permission not found");
      }

      // Check if another permission with same name exists
      if (name && name !== permission.name) {
        const existingPermission = await PermissionModel.findOne({
          name,
          _id: { $ne: id },
        });
        if (existingPermission) {
          return sendErrorFeedback(
            res,
            409,
            "Permission with this name already exists",
          );
        }
      }

      const updateData: any = {};
      if (name) updateData.name = name;
      if (description) updateData.description = description;
      if (resource) updateData.resource = resource;
      if (action) updateData.action = action;
      if (isActive !== undefined) updateData.isActive = isActive;

      const updatedPermission = await PermissionModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true },
      );

      return sendSuccessFeedback(res, "Permission updated successfully", {
        permission: updatedPermission,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const DeletePermission = async (req: Request<IdParams>, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const permission = await PermissionModel.findById(id);
      if (!permission) {
        return sendErrorFeedback(res, 404, "Permission not found");
      }

      // Check if permission is being used by any roles
      const rolesUsingPermission = await RoleModel.find({ permissions: id });
      if (rolesUsingPermission.length > 0) {
        return sendErrorFeedback(
          res,
          400,
          "Cannot delete permission that is being used by roles",
        );
      }

      await PermissionModel.findByIdAndDelete(id);

      return sendSuccessFeedback(res, "Permission deleted successfully");
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetAllRoles = async (
    req: Request<never, never, never, RoleFilterQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { page = 1, limit = 20, isActive } = req.query as any;

      // Build filter
      const filter: any = {};
      if (isActive !== undefined) filter.isActive = isActive === "true";

      const paginationOptions = getPaginationOptions({
        page: page as string,
        limit: limit as string,
      });

      const roles = await RoleModel.paginate(filter, {
        ...paginationOptions,
        sort: { level: -1, name: 1 },
        populate: [
          { path: "permissions", select: "name description resource action" },
        ],
      });

      return sendSuccessFeedback(res, "Roles retrieved", {
        roles: roles.docs,
        pagination: {
          currentPage: roles.page,
          totalPages: roles.totalPages,
          totalDocs: roles.totalDocs,
          hasNextPage: roles.hasNextPage,
          hasPrevPage: roles.hasPrevPage,
        },
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };
  const GetSingleRole = async (req: Request<IdParams>, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const role = await RoleModel.findById(id).populate([
        { path: "permissions", select: "name description resource action" },
      ]);

      if (!role) {
        return sendErrorFeedback(res, 404, "Role not found");
      }

      return sendSuccessFeedback(res, "Role retrieved", { role });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const CreateRole = async (
    req: Request<never, never, RoleCreateRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { name, description, permissions, level } = req.body;

      // Check if role with same name already exists
      const existingRole = await RoleModel.findOne({ name });
      if (existingRole) {
        return sendErrorFeedback(
          res,
          409,
          "Role with this name already exists",
        );
      }

      // Verify all permissions exist
      if (permissions && permissions.length > 0) {
        const permissionCount = await PermissionModel.countDocuments({
          _id: { $in: permissions },
        });
        if (permissionCount !== permissions.length) {
          return sendErrorFeedback(
            res,
            400,
            "One or more permissions are invalid",
          );
        }
      }

      const role = await RoleModel.create({
        name,
        description,
        permissions: permissions || [],
        level: level || 1,
      });

      const populatedRole = await RoleModel.findById(role._id).populate([
        { path: "permissions", select: "name description resource action" },
      ]);

      return sendSuccessFeedback(res, "Role created successfully", {
        role: populatedRole,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const UpdateRole = async (
    req: Request<IdParams, never, RoleUpdateRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;
      const { name, description, permissions, level, isActive } = req.body;

      const role = await RoleModel.findById(id);
      if (!role) {
        return sendErrorFeedback(res, 404, "Role not found");
      }

      // Check if another role with same name exists
      if (name && name !== role.name) {
        const existingRole = await RoleModel.findOne({
          name,
          _id: { $ne: id },
        });
        if (existingRole) {
          return sendErrorFeedback(
            res,
            409,
            "Role with this name already exists",
          );
        }
      }

      // Verify all permissions exist
      if (permissions && permissions.length > 0) {
        const permissionCount = await PermissionModel.countDocuments({
          _id: { $in: permissions },
        });
        if (permissionCount !== permissions.length) {
          return sendErrorFeedback(
            res,
            400,
            "One or more permissions are invalid",
          );
        }
      }

      const updateData: any = {};
      if (name) updateData.name = name;
      if (description) updateData.description = description;
      if (permissions !== undefined) updateData.permissions = permissions;
      if (level !== undefined) updateData.level = level;
      if (isActive !== undefined) updateData.isActive = isActive;

      const updatedRole = await RoleModel.findByIdAndUpdate(id, updateData, {
        new: true,
      }).populate([
        { path: "permissions", select: "name description resource action" },
      ]);

      return sendSuccessFeedback(res, "Role updated successfully", {
        role: updatedRole,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const DeleteRole = async (req: Request<IdParams>, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const role = await RoleModel.findById(id);
      if (!role) {
        return sendErrorFeedback(res, 404, "Role not found");
      }

      // Check if role is being used by any admins
      const adminsUsingRole = await AdminModel.find({ role: id });
      if (adminsUsingRole.length > 0) {
        return sendErrorFeedback(
          res,
          400,
          "Cannot delete role that is being used by admins",
        );
      }

      await RoleModel.findByIdAndDelete(id);

      return sendSuccessFeedback(res, "Role deleted successfully");
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const AssignPermissionToRole = async (
    req: Request<IdParams, never, AssignPermissionRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { roleId, permissionId } = req.body;

      const role = await RoleModel.findById(roleId);
      if (!role) {
        return sendErrorFeedback(res, 404, "Role not found");
      }

      const permission = await PermissionModel.findById(permissionId);
      if (!permission) {
        return sendErrorFeedback(res, 404, "Permission not found");
      }

      // Check if permission is already assigned to role
      if (role.permissions.includes(permissionId)) {
        return sendErrorFeedback(
          res,
          400,
          "Permission is already assigned to this role",
        );
      }

      await RoleModel.findByIdAndUpdate(roleId, {
        $push: { permissions: permissionId },
      });

      return sendSuccessFeedback(
        res,
        "Permission assigned to role successfully",
      );
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const RemovePermissionFromRole = async (
    req: Request<IdParams, never, AssignPermissionRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { roleId, permissionId } = req.body;

      const role = await RoleModel.findById(roleId);
      if (!role) {
        return sendErrorFeedback(res, 404, "Role not found");
      }

      const permission = await PermissionModel.findById(permissionId);
      if (!permission) {
        return sendErrorFeedback(res, 404, "Permission not found");
      }

      // Check if permission is assigned to role
      if (!role.permissions.includes(permissionId)) {
        return sendErrorFeedback(
          res,
          400,
          "Permission is not assigned to this role",
        );
      }

      await RoleModel.findByIdAndUpdate(roleId, {
        $pull: { permissions: permissionId },
      });

      return sendSuccessFeedback(
        res,
        "Permission removed from role successfully",
      );
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const CreateAdmin = async (
    req: Request<never, never, AdminCreateRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { password: reqPassword, ...adminData } = req.body;
      const { firstName, lastName, email, phoneNumber, role, permissions } =
        adminData;

      // Check if admin with same email already exists
      const existingAdmin = await AdminModel.findOne({ email });
      if (existingAdmin) {
        return sendErrorFeedback(
          res,
          409,
          "Admin with this email already exists",
        );
      }

      // Hash password
      const hashedPassword = await bcryptjs.hash(reqPassword, 8);

      const admin = await AdminModel.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phoneNumber,
        role: role || "admin",
        permissions: permissions || [],
      });

      // Remove password from response
      const adminResponse: any = admin.toObject();
      const { password: _, ...adminWithoutPassword } = adminResponse;

      return sendSuccessFeedback(res, "Admin created successfully", {
        admin: adminWithoutPassword,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const UpdateAdminRole = async (
    req: Request<IdParams, never, AdminUpdateRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;
      const { role, permissions } = req.body;

      const updateData: any = {};
      if (role) updateData.role = role;
      if (permissions !== undefined) updateData.permissions = permissions;

      const updatedAdmin = await AdminModel.findByIdAndUpdate(id, updateData, {
        new: true,
      }).select("-password");

      return sendSuccessFeedback(res, "Admin role updated successfully", {
        admin: updatedAdmin,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const DeactivateAdmin = async (req: Request<IdParams>, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const admin = await AdminModel.findById(id);
      if (!admin) {
        return sendErrorFeedback(res, 404, "Admin not found");
      }

      await AdminModel.findByIdAndUpdate(id, { active: false });

      return sendSuccessFeedback(res, "Admin deactivated successfully");
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const ActivateAdmin = async (req: Request<IdParams>, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const admin = await AdminModel.findById(id);
      if (!admin) {
        return sendErrorFeedback(res, 404, "Admin not found");
      }

      await AdminModel.findByIdAndUpdate(id, { active: true });

      return sendSuccessFeedback(res, "Admin activated successfully");
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetAllAdmins = async (
    req: Request<never, never, never, AdminFilterQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { page = 1, limit = 20, role, isActive } = req.query as any;

      // Build filter
      const filter: any = {};
      if (role) filter.role = role;
      if (isActive !== undefined) filter.isActive = isActive === "true";

      const paginationOptions = getPaginationOptions({
        page: page as string,
        limit: limit as string,
      });

      const admins = await AdminModel.paginate(filter, {
        ...paginationOptions,
        sort: { createdAt: -1 },
        select: "-password -verificationCode -resetPasswordToken",
        populate: [
          { path: "permissions", select: "name description resource action" },
        ],
      });

      return sendSuccessFeedback(res, "Admins retrieved", {
        admins: admins.docs,
        pagination: {
          currentPage: admins.page,
          totalPages: admins.totalPages,
          totalDocs: admins.totalDocs,
          hasNextPage: admins.hasNextPage,
          hasPrevPage: admins.hasPrevPage,
        },
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetSingleAdmin = async (req: Request<IdParams>, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const admin = await AdminModel.findById(id)
        .select("-password -verificationCode -resetPasswordToken")
        .populate([
          { path: "permissions", select: "name description resource action" },
        ]);
      if (!admin) {
        return sendErrorFeedback(res, 404, "Admin not found");
      }

      return sendSuccessFeedback(res, "Admin retrieved", { admin });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const UpdateAdmin = async (
    req: Request<IdParams, never, AdminProfileUpdateRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;
      const { firstName, lastName, phoneNumber, profileImage } = req.body;

      const admin = await AdminModel.findById(id);
      if (!admin) {
        return sendErrorFeedback(res, 404, "Admin not found");
      }

      const updateData: any = {};
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (phoneNumber) updateData.phoneNumber = phoneNumber;
      if (profileImage) updateData.profileImage = profileImage;

      const updatedAdmin = await AdminModel.findByIdAndUpdate(id, updateData, {
        new: true,
      })
        .select("-password -verificationCode -resetPasswordToken")
        .populate([
          { path: "permissions", select: "name description resource action" },
        ]);

      return sendSuccessFeedback(res, "Admin updated successfully", {
        admin: updatedAdmin,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };
  return {
    GetSinglePermission,
    GetAllPermissions,
    CreatePermission,
    UpdatePermission,
    DeletePermission,
    GetSingleRole,
    GetAllRoles,
    CreateRole,
    UpdateRole,
    DeleteRole,
    AssignPermissionToRole,
    RemovePermissionFromRole,
    CreateAdmin,
    UpdateAdminRole,
    DeactivateAdmin,
    ActivateAdmin,
    GetAllAdmins,
    GetSingleAdmin,
    UpdateAdmin,
  };
};
