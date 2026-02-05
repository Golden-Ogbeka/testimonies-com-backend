import { Request, Response } from "express";
import { sendCatchFeedback } from "../../../../functions/feedback";

export const AdminRolePromotionController = () => {
  const GetAllPermissions = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };
  const GetSinglePermission = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const CreatePermission = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const UpdatePermission = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const DeletePermission = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const GetAllRoles = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };
  const GetSingleRole = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const CreateRole = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const UpdateRole = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const DeleteRole = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const AssignPermissionToRole = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const RemovePermissionFromRole = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const CreateAdmin = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const UpdateAdminRole = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const DeactivateAdmin = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const ActivateAdmin = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const GetAllAdmins = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const GetSingleAdmin = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const UpdateAdmin = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
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
