import { Router } from "express";
import { AdminUserController } from "../../controllers/admin/user";

const AdminUserRouter = Router();
const Controller = AdminUserController();

// Get all users

// Get user by ID

// Update user details

// Deactivate user account

// Activate user account

// Get user kyc applications

// Get user kyc application by ID

// Approve user kyc application

// Reject user kyc application

// Get users' profile statistics (such as number of testimonies submitted, average ratings, etc.)

// Get profile statistics of a particular user by ID

// Get kyc status of a particular user by ID

// Get user message statistics (such as number of messages sent, received, etc.)

// Get message statistics of a particular user by ID

export default AdminUserRouter;
