import bcryptjs from "bcryptjs";
import { Response } from "express";
import { validationResult } from "express-validator";
import { getAdminUserDetails } from "../../../../functions/auth";
import {
  sendCatchFeedback,
  sendErrorFeedback,
  sendSuccessFeedback,
  sendValidationErrorFeedback,
} from "../../../../functions/feedback";
import AdminModel from "../../../../models/admin.model";
import PermissionModel from "../../../../models/permission.model";
import { CustomRequest } from "../../../../types/express";
import {
  AdminCreateRequestBody,
  AdminFilterQuery,
  AdminProfileUpdateRequestBody,
  AdminUpdateRequestBody,
  IdParams,
  PaginationQuery,
  PermissionCreateRequestBody,
  PermissionUpdateRequestBody,
} from "../../../../types/requests";
import { getPaginationOptions } from "../../../../utils/pagination";

export const AdminRolePermissionController = () => {
  const GetAllPermissions = async (
    req: CustomRequest<never, any, any, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const paginationOptions = getPaginationOptions(req);

      const permissions = await PermissionModel.paginate(
        {},
        {
          ...paginationOptions,
          sort: { createdAt: 1 },
        },
      );

      return sendSuccessFeedback(res, "Permissions retrieved", {
        permissions,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };
  const GetSinglePermission = async (
    req: CustomRequest<IdParams>,
    res: Response,
  ) => {
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
    req: CustomRequest<never, any, PermissionCreateRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { name, description } = req.body;

      const adminDetails = await getAdminUserDetails(req);

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
        createdBy: adminDetails._id,
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
    req: CustomRequest<IdParams, any, PermissionUpdateRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;
      const { name, description } = req.body;

      const adminDetails = await getAdminUserDetails(req);
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

      const updateData: Record<string, any> = {};
      if (name) updateData.name = name;
      if (description) updateData.description = description;
      updateData.updatedBy = adminDetails._id;

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

  const DeletePermission = async (
    req: CustomRequest<IdParams>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const permission = await PermissionModel.findByIdAndDelete(id);
      if (!permission) {
        return sendErrorFeedback(res, 404, "Permission not found");
      }

      return sendSuccessFeedback(res, "Permission deleted successfully");
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const CreateAdmin = async (
    req: CustomRequest<never, any, AdminCreateRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { password: reqPassword, ...adminData } = req.body;
      const { firstName, lastName, email, phoneNumber, role, permissions } =
        adminData;

      const adminDetails = await getAdminUserDetails(req);

      // Check if admin with same email already exists
      const existingAdmin = await AdminModel.findOne({ email });
      if (existingAdmin) {
        return sendErrorFeedback(
          res,
          409,
          "Admin with this email already exists",
        );
      }

      // confirm permissions
      if (permissions) {
        const existingPermissions = await PermissionModel.find({
          _id: { $in: permissions },
        });
        if (existingPermissions.length !== permissions.length) {
          return sendErrorFeedback(res, 400, "Invalid permissions");
        }
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
        createdBy: adminDetails._id,
        permissions: permissions || [],
      });

      // Remove password from response
      const { password: _, ...adminResponse } = admin.toObject();

      return sendSuccessFeedback(res, "Admin created successfully", {
        admin: adminResponse,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const UpdateAdminRole = async (
    req: CustomRequest<IdParams, any, AdminUpdateRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const adminDetails = await getAdminUserDetails(req);
      const { id } = req.params;
      const { role } = req.body;

      // Prevent self-modification
      if (id === String(adminDetails._id)) {
        return sendErrorFeedback(res, 400, "You cannot modify your own role");
      }

      // Get target admin
      const targetAdmin = await AdminModel.findById(id);
      if (!targetAdmin) {
        return sendErrorFeedback(res, 404, "Admin not found");
      }

      // Prevent non-super-admin from modifying super-admin
      if (
        targetAdmin.role === "super-admin" &&
        adminDetails.role !== "super-admin"
      ) {
        return sendErrorFeedback(
          res,
          403,
          "You cannot modify a super-admin account",
        );
      }

      const updateData: Record<string, any> = {};
      updateData.role = role;
      updateData.updatedBy = adminDetails._id;

      const updatedAdmin = await AdminModel.findByIdAndUpdate(id, updateData, {
        new: true,
      });
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

  const UpdateAdminPermissions = async (
    req: CustomRequest<IdParams, any, { permissions: string[] }>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const adminDetails = await getAdminUserDetails(req);
      const { id } = req.params;
      const { permissions } = req.body;

      // Confirm permissions
      const existingPermissions = await PermissionModel.find({
        _id: { $in: permissions },
      });
      if (existingPermissions.length !== permissions.length) {
        return sendErrorFeedback(res, 400, "Invalid permissions");
      }
      const updateData: Record<string, any> = {};
      updateData.permissions = permissions;
      updateData.updatedBy = adminDetails._id;

      const updatedAdmin = await AdminModel.findByIdAndUpdate(id, updateData, {
        new: true,
      });
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

  const DeactivateAdmin = async (
    req: CustomRequest<IdParams>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;
      const adminDetails = await getAdminUserDetails(req);

      // Prevent self-deactivation
      if (id === String(adminDetails._id)) {
        return sendErrorFeedback(
          res,
          400,
          "You cannot deactivate your own account",
        );
      }

      // Get target admin
      const targetAdmin = await AdminModel.findById(id);
      if (!targetAdmin) {
        return sendErrorFeedback(res, 404, "Admin not found");
      }

      // Prevent non-super-admin from deactivating super-admin
      if (
        targetAdmin.role === "super-admin" &&
        adminDetails.role !== "super-admin"
      ) {
        return sendErrorFeedback(
          res,
          403,
          "You cannot deactivate a super-admin account",
        );
      }

      const updatedAdmin = await AdminModel.findByIdAndUpdate(
        id,
        {
          active: false,
          updatedBy: adminDetails._id,
        },
        { new: true },
      );

      return sendSuccessFeedback(res, "Admin deactivated successfully", {
        admin: updatedAdmin,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const ActivateAdmin = async (req: CustomRequest<IdParams>, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;
      const adminDetails = await getAdminUserDetails(req);

      const updatedAdmin = await AdminModel.findByIdAndUpdate(
        id,
        {
          active: true,
          updatedBy: adminDetails._id,
        },
        { new: true },
      );

      if (!updatedAdmin) {
        return sendErrorFeedback(res, 404, "Admin not found");
      }
      return sendSuccessFeedback(res, "Admin activated successfully", {
        admin: updatedAdmin,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetAllAdmins = async (
    req: CustomRequest<never, any, any, AdminFilterQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const adminDetails = await getAdminUserDetails(req);
      const { role, isActive } = req.query;

      // Build filter
      const filter: any = {};
      if (role) filter.role = role;
      if (isActive !== undefined) {
        filter.isActive =
          String(isActive).toLowerCase() === "true" || isActive === true;
      }

      if (adminDetails.role !== "super-admin") {
        filter.role = "admin";
      }

      const paginationOptions = getPaginationOptions(req);

      const admins = await AdminModel.paginate(filter, {
        ...paginationOptions,
        sort: { createdAt: -1 },
      });

      return sendSuccessFeedback(res, "Admins retrieved", {
        admins,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetSingleAdmin = async (
    req: CustomRequest<IdParams>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const adminDetails = await getAdminUserDetails(req);

      const { id } = req.params;

      const admin = await AdminModel.findById(id);

      if (!admin) {
        return sendErrorFeedback(res, 404, "Admin not found");
      }

      if (adminDetails.role !== "super-admin" && admin.role === "super-admin") {
        return sendErrorFeedback(
          res,
          403,
          "You do not have permission to view this admin",
        );
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
    req: CustomRequest<IdParams, any, AdminProfileUpdateRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;
      const { firstName, lastName, phoneNumber } = req.body;

      const adminDetails = await getAdminUserDetails(req);

      const updateData: Record<string, any> = {};
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (phoneNumber) updateData.phoneNumber = phoneNumber;
      updateData.updatedBy = adminDetails._id;

      const updatedAdmin = await AdminModel.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      if (!updatedAdmin) {
        return sendErrorFeedback(res, 404, "Admin not found");
      }
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
    CreateAdmin,
    UpdateAdminRole,
    DeactivateAdmin,
    ActivateAdmin,
    GetAllAdmins,
    GetSingleAdmin,
    UpdateAdmin,
    UpdateAdminPermissions,
  };
};
