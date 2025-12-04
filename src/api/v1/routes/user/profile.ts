import { Router } from "express";
import { UserProfileController } from "../../controllers/user/profile";

const UserProfileRouter = Router();
const Controller = UserProfileController();

// Get logged in user's profile details

// Update logged in user's profile details

// Delete logged in user's profile

// Update logged in user's profile picture

// Update logged in user's profile cover photo

// Get another user's public profile by username

// Get another user's profile by user id

// Search users by name or username

// Follow a user

// Unfollow a user

// Block a user

// Unblock a user

// Get followers of a user

// Get following of a user

// Get blocked users

// Get whether logged in user follows another user

// Get whether logged in user has blocked another user

// Get logged in user's profile share url

// Get another user's profile share url by username

// Get user profile statistics (number of followers, following, testimonies, replies, likes received, views received)

// View broadcast testimony requests

// View broadcast testimony request by id

// Approve broadcast testimony request

// Reject broadcast testimony request

// Get user's kyc status

// Upload user's kyc documents

// Submit user's kyc application

// Get user's kyc application history

// Get user's kyc application by id which includes status and admin feedback

// Delete user's kyc application by id

export default UserProfileRouter;
