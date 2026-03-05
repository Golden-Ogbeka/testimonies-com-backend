import { Request, Response } from "express";
import {
  sendCatchFeedback,
  sendErrorFeedback,
  sendSuccessFeedback,
} from "../../../../functions/feedback";
import { IOrganization } from "../../../../models/organization.model";
import TeamActivityLogModel from "../../../../models/team-activity-log.model";
import TeamMemberModel from "../../../../models/team-member.model";
import TeamPermissionModel from "../../../../models/team-permission.model";
import UserModel, { IUser } from "../../../../models/user.model";
import { getPaginationOptions } from "../../../../utils/pagination";

export const UserTeamController = () => {
  // Ensure this is an organization making the request
  const checkOrganization = (req: Request): string | null => {
    const user = (req as any).user as IUser | IOrganization;
    if (user.accountType === "organization") {
      return (user as IOrganization)._id as string;
    }
    return null;
  };

  const GetAllTeamMembers = async (req: Request, res: Response) => {
    try {
      const orgId = checkOrganization(req);
      if (!orgId)
        return sendErrorFeedback(
          res,
          403,
          "Only organizations can access this",
        );

      const { page, limit } = req.query as any;
      const options = getPaginationOptions(
        { query: { page, limit } },
        { createdAt: -1 },
        [
          {
            path: "userDetails",
            select: "firstName lastName email profileImage",
          },
          { path: "roleDetails" },
        ],
      );

      // @ts-expect-error - paginate method exists but not in types
      const teamMembers = await TeamMemberModel.paginate(
        { organization: orgId },
        options as any,
      );

      return sendSuccessFeedback(res, "Team members retrieved successfully", {
        teamMembers,
      });
    } catch (error) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  const AddTeamMember = async (req: Request, res: Response) => {
    try {
      const orgId = checkOrganization(req);
      if (!orgId)
        return sendErrorFeedback(
          res,
          403,
          "Only organizations can access this",
        );

      const { email, roleId } = req.body;
      if (!email || !roleId)
        return sendErrorFeedback(res, 400, "Email and roleId are required");

      const user = await UserModel.findOne({ email });
      if (!user)
        return sendErrorFeedback(res, 404, "User not found with this email");

      const role = await TeamPermissionModel.findOne({
        _id: roleId,
        createdBy: orgId,
      });
      if (!role)
        return sendErrorFeedback(
          res,
          404,
          "Role not found within your organization",
        );

      const existingMember = await TeamMemberModel.findOne({
        organization: orgId,
        user: user._id,
      });
      if (existingMember)
        return sendErrorFeedback(res, 409, "User is already a team member");

      const newMember = await TeamMemberModel.create({
        user: user._id,
        organization: orgId,
        role: roleId,
        addedBy: orgId,
      });

      return sendSuccessFeedback(
        res,
        "Team member added successfully",
        { teamMember: newMember },
        201,
      );
    } catch (error) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  const DeactivateTeamMember = async (req: Request, res: Response) => {
    try {
      const orgId = checkOrganization(req);
      if (!orgId)
        return sendErrorFeedback(
          res,
          403,
          "Only organizations can access this",
        );

      const member = await TeamMemberModel.findOneAndUpdate(
        { _id: req.params.id, organization: orgId },
        { status: "inactive" },
        { new: true },
      );
      if (!member) return sendErrorFeedback(res, 404, "Team member not found");

      return sendSuccessFeedback(res, "Team member deactivated", {
        teamMember: member,
      });
    } catch (error) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  const ReactivateTeamMember = async (req: Request, res: Response) => {
    try {
      const orgId = checkOrganization(req);
      if (!orgId)
        return sendErrorFeedback(
          res,
          403,
          "Only organizations can access this",
        );

      const member = await TeamMemberModel.findOneAndUpdate(
        { _id: req.params.id, organization: orgId },
        { status: "active" },
        { new: true },
      );
      if (!member) return sendErrorFeedback(res, 404, "Team member not found");

      return sendSuccessFeedback(res, "Team member reactivated", {
        teamMember: member,
      });
    } catch (error) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  const UpdateTeamMember = async (req: Request, res: Response) => {
    try {
      const orgId = checkOrganization(req);
      if (!orgId)
        return sendErrorFeedback(
          res,
          403,
          "Only organizations can access this",
        );

      const { roleId, status } = req.body;
      const updateData: any = {};

      if (roleId) {
        const role = await TeamPermissionModel.findOne({
          _id: roleId,
          createdBy: orgId,
        });
        if (!role) return sendErrorFeedback(res, 404, "Role not found");
        updateData.role = roleId;
      }
      if (status) updateData.status = status;

      const member = await TeamMemberModel.findOneAndUpdate(
        { _id: req.params.id, organization: orgId },
        updateData,
        { new: true },
      )
        .populate("roleDetails")
        .populate("userDetails", "firstName lastName email profileImage");

      if (!member) return sendErrorFeedback(res, 404, "Team member not found");

      return sendSuccessFeedback(res, "Team member updated", {
        teamMember: member,
      });
    } catch (error) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  const GetTeamMemberPermissions = async (req: Request, res: Response) => {
    try {
      const orgId = checkOrganization(req);
      if (!orgId) {
        // If it's a user, check if they belong to a team and get permissions
        const userId = ((req as any).user as IUser)._id;
        const member = await TeamMemberModel.findOne({ user: userId }).populate(
          "roleDetails",
        );
        if (!member)
          return sendErrorFeedback(res, 404, "You are not part of any team");
        return sendSuccessFeedback(res, "Permissions retrieved", {
          permissions: member.role,
        });
      }

      const roles = await TeamPermissionModel.find({ createdBy: orgId });
      return sendSuccessFeedback(res, "Permissions retrieved", { roles });
    } catch (error) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  const CreateTeamMemberRole = async (req: Request, res: Response) => {
    try {
      const orgId = checkOrganization(req);
      if (!orgId)
        return sendErrorFeedback(
          res,
          403,
          "Only organizations can access this",
        );

      const { name, description } = req.body;
      if (!name || !description)
        return sendErrorFeedback(res, 400, "Name and description required");

      const role = await TeamPermissionModel.create({
        name,
        description,
        createdBy: orgId,
      });

      return sendSuccessFeedback(
        res,
        "Role created successfully",
        { role },
        201,
      );
    } catch (error) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  const UpdateTeamMemberRole = async (req: Request, res: Response) => {
    try {
      const orgId = checkOrganization(req);
      if (!orgId)
        return sendErrorFeedback(
          res,
          403,
          "Only organizations can access this",
        );

      const { name, description } = req.body;
      const role = await TeamPermissionModel.findOneAndUpdate(
        { _id: req.params.id, createdBy: orgId },
        { name, description },
        { new: true },
      );

      if (!role) return sendErrorFeedback(res, 404, "Role not found");

      return sendSuccessFeedback(res, "Role updated", { role });
    } catch (error) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  const DeleteTeamMemberRole = async (req: Request, res: Response) => {
    try {
      const orgId = checkOrganization(req);
      if (!orgId)
        return sendErrorFeedback(
          res,
          403,
          "Only organizations can access this",
        );

      const inUse = await TeamMemberModel.findOne({
        organization: orgId,
        role: req.params.id,
      });
      if (inUse)
        return sendErrorFeedback(
          res,
          409,
          "Role is currently assigned to one or more members",
        );

      const role = await TeamPermissionModel.findOneAndDelete({
        _id: req.params.id,
        createdBy: orgId,
      });
      if (!role) return sendErrorFeedback(res, 404, "Role not found");

      return sendSuccessFeedback(res, "Role deleted");
    } catch (error) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  const GetTeamMemberRoles = async (req: Request, res: Response) => {
    try {
      const orgId = checkOrganization(req);
      if (!orgId)
        return sendErrorFeedback(
          res,
          403,
          "Only organizations can access this",
        );

      const { page, limit } = req.query as any;
      const options = getPaginationOptions(
        { query: { page, limit } },
        { createdAt: -1 },
      );

      // @ts-expect-error - paginate method exists but not in types
      const roles = await TeamPermissionModel.paginate(
        { createdBy: orgId },
        options as any,
      );

      return sendSuccessFeedback(res, "Roles retrieved", { roles });
    } catch (error) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  const GetTeamMemberRole = async (req: Request, res: Response) => {
    try {
      const orgId = checkOrganization(req);
      if (!orgId)
        return sendErrorFeedback(
          res,
          403,
          "Only organizations can access this",
        );

      const role = await TeamPermissionModel.findOne({
        _id: req.params.id,
        createdBy: orgId,
      });
      if (!role) return sendErrorFeedback(res, 404, "Role not found");

      return sendSuccessFeedback(res, "Role retrieved", { role });
    } catch (error) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  const AssignRoleToTeamMember = async (req: Request, res: Response) => {
    try {
      const orgId = checkOrganization(req);
      if (!orgId)
        return sendErrorFeedback(
          res,
          403,
          "Only organizations can access this",
        );

      const { roleId } = req.body;
      const role = await TeamPermissionModel.findOne({
        _id: roleId,
        createdBy: orgId,
      });
      if (!role) return sendErrorFeedback(res, 404, "Role not found");

      const member = await TeamMemberModel.findOneAndUpdate(
        { _id: req.params.id, organization: orgId },
        { role: roleId },
        { new: true },
      ).populate("roleDetails");

      if (!member) return sendErrorFeedback(res, 404, "Team member not found");

      return sendSuccessFeedback(res, "Role assigned to member", {
        teamMember: member,
      });
    } catch (error) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  const GetTeamMemberDetails = async (req: Request, res: Response) => {
    try {
      const orgId = checkOrganization(req);
      if (!orgId)
        return sendErrorFeedback(
          res,
          403,
          "Only organizations can access this",
        );

      const member = await TeamMemberModel.findOne({
        _id: req.params.id,
        organization: orgId,
      })
        .populate("roleDetails")
        .populate(
          "userDetails",
          "firstName lastName email profileImage phoneNumber address bio",
        );

      if (!member) return sendErrorFeedback(res, 404, "Team member not found");

      return sendSuccessFeedback(res, "Member details retrieved", {
        teamMember: member,
      });
    } catch (error) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  const GetTeamMemberActivityLogs = async (req: Request, res: Response) => {
    try {
      const orgId = checkOrganization(req);
      if (!orgId)
        return sendErrorFeedback(
          res,
          403,
          "Only organizations can access this",
        );

      const { page, limit } = req.query as any;
      const options = getPaginationOptions(
        { query: { page, limit } },
        { createdAt: -1 },
      );

      // @ts-expect-error - paginate method exists but not in types
      const logs = await TeamActivityLogModel.paginate(
        {
          organization: orgId,
          teamMember: req.params.id,
        },
        options as any,
      );

      return sendSuccessFeedback(res, "Activity logs retrieved", { logs });
    } catch (error) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  const LogTeamMemberActivity = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { organizationId, action, description } = req.body;

      const member = await TeamMemberModel.findOne({
        user: user._id,
        organization: organizationId,
      });
      if (!member) return sendErrorFeedback(res, 403, "Not a team member");

      const log = await TeamActivityLogModel.create({
        teamMember: member._id,
        organization: organizationId,
        action,
        description,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      return sendSuccessFeedback(res, "Activity logged", { log }, 201);
    } catch (error) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  const GetAllActivityLogs = async (req: Request, res: Response) => {
    try {
      const orgId = checkOrganization(req);
      if (!orgId)
        return sendErrorFeedback(
          res,
          403,
          "Only organizations can access this",
        );

      const { page, limit } = req.query as any;
      const options = getPaginationOptions(
        { query: { page, limit } },
        { createdAt: -1 },
        [
          {
            path: "teamMemberDetails",
            populate: {
              path: "userDetails",
              select: "firstName lastName email",
            },
          },
        ],
      );

      // @ts-expect-error - paginate method exists but not in types
      const logs = await TeamActivityLogModel.paginate(
        { organization: orgId },
        options as any,
      );

      return sendSuccessFeedback(res, "All activity logs retrieved", { logs });
    } catch (error) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  const SearchTeamMembers = async (req: Request, res: Response) => {
    try {
      const orgId = checkOrganization(req);
      if (!orgId)
        return sendErrorFeedback(
          res,
          403,
          "Only organizations can access this",
        );

      const { q, page, limit } = req.query as any;

      // We search users first and then find those members in the team
      const users = await UserModel.find(
        { $text: { $search: q as string } },
        { _id: 1 },
      );

      const userIds = users.map((u) => u._id);

      const options = getPaginationOptions(
        { query: { page, limit } },
        { createdAt: -1 },
        [
          {
            path: "userDetails",
            select: "firstName lastName email profileImage",
          },
          { path: "roleDetails" },
        ],
      );

      // @ts-expect-error - paginate method exists but not in types
      const teamMembers = await TeamMemberModel.paginate(
        { organization: orgId, user: { $in: userIds } },
        options as any,
      );

      return sendSuccessFeedback(res, "Team members searched successfully", {
        teamMembers,
      });
    } catch (error) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  const RemoveTeamMember = async (req: Request, res: Response) => {
    try {
      const orgId = checkOrganization(req);
      if (!orgId)
        return sendErrorFeedback(
          res,
          403,
          "Only organizations can access this",
        );

      const member = await TeamMemberModel.findOneAndDelete({
        _id: req.params.id,
        organization: orgId,
      });
      if (!member) return sendErrorFeedback(res, 404, "Team member not found");

      return sendSuccessFeedback(res, "Team member removed");
    } catch (error) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  return {
    GetAllTeamMembers,
    AddTeamMember,
    DeactivateTeamMember,
    ReactivateTeamMember,
    UpdateTeamMember,
    GetTeamMemberPermissions,
    CreateTeamMemberRole,
    UpdateTeamMemberRole,
    DeleteTeamMemberRole,
    GetTeamMemberRoles,
    GetTeamMemberRole,
    AssignRoleToTeamMember,
    GetTeamMemberDetails,
    GetTeamMemberActivityLogs,
    LogTeamMemberActivity,
    GetAllActivityLogs,
    SearchTeamMembers,
    RemoveTeamMember,
  };
};
