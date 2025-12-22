import { Router } from "express";
import { param } from "express-validator";
import { isValidObjectId } from "../../../../middleware/validation";
import { UserTeamController } from "../../controllers/user/team";

const UserTeamRouter = Router();
const Controller = UserTeamController();

// Get all team members
UserTeamRouter.get("/members", Controller.GetAllTeamMembers);

// Add a new team member
UserTeamRouter.post("/members", Controller.AddTeamMember);

// Deactivate a team member
UserTeamRouter.post(
  "/members/:id/deactivate",
  param("id", "Team member ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.DeactivateTeamMember,
);

// Reactivate a team member
UserTeamRouter.post(
  "/members/:id/reactivate",
  param("id", "Team member ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.ReactivateTeamMember,
);

// Update team member
UserTeamRouter.put(
  "/members/:id",
  param("id", "Team member ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.UpdateTeamMember,
);

// Get organizations' team member permissions
UserTeamRouter.get("/permissions", Controller.GetTeamMemberPermissions);

// Create team member roles (with the permissions of organizations)
UserTeamRouter.post("/roles", Controller.CreateTeamMemberRole);

// Update team member roles
UserTeamRouter.put(
  "/roles/:id",
  param("id", "Role ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.UpdateTeamMemberRole,
);

// Delete team member roles (if no user is assigned to that role)
UserTeamRouter.delete(
  "/roles/:id",
  param("id", "Role ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.DeleteTeamMemberRole,
);

// Get team member roles
UserTeamRouter.get("/roles", Controller.GetTeamMemberRoles);

// Get single team member role by ID
UserTeamRouter.get(
  "/roles/:id",
  param("id", "Role ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetTeamMemberRole,
);

// Assign role to team member
UserTeamRouter.post(
  "/members/:id/assign-role",
  param("id", "Team member ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.AssignRoleToTeamMember,
);

// View team member details by ID
UserTeamRouter.get(
  "/members/:id",
  param("id", "Team member ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetTeamMemberDetails,
);

// View activity logs of a specific team member
UserTeamRouter.get(
  "/members/:id/activity",
  param("id", "Team member ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetTeamMemberActivityLogs,
);

// Log team member activity (make this a service for reuse)
UserTeamRouter.post("/activity/log", Controller.LogTeamMemberActivity);

// View all activity logs of team members
UserTeamRouter.get("/activity/all", Controller.GetAllActivityLogs);

// Search team members by name or email
UserTeamRouter.get("/members/search", Controller.SearchTeamMembers);

// Remove team member from organization
UserTeamRouter.delete(
  "/members/:id",
  param("id", "Team member ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.RemoveTeamMember,
);

export default UserTeamRouter;
