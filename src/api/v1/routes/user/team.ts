import { Router } from "express";
import { UserTeamController } from "../../controllers/user/team";

const UserTeamRouter = Router();
const Controller = UserTeamController();

// Get all team members

// Add a new team member

// Deactivate a team member

// Reactivate a team member

// Update team member

// Get organizations' team member permissions

// Create team member roles (with the permissions of organizations)

// Update team member roles

// Delete team member roles (if no user is assigned to that role)

// Get team member roles

// Get single team member role by ID

// Assign role to team member

// View team member details by ID

// View activity logs of a specific team member

// Log team member activity (make this a service for reuse)

// View all activity logs of team members

// Search team members by name or email

// Remove team member from organization

export default UserTeamRouter;
