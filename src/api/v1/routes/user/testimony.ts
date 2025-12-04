import { Router } from "express";
import { UserTestimonyController } from "../../controllers/user/testimony";

const UserTestimonyRouter = Router();
const Controller = UserTestimonyController();

// Get testimonies (unauthenticated) - Would not include replies and analytics details. Would just include the count

// Get single testimony by id (unauthenticated) - Would not include replies and analytics details. Would just include the count

// Get testimonies (authenticated) - Would include the details of analytics (replies, etc)

// Get single testimony by id (authenticated) - Would include the details of analytics (replies, etc)

// Create testimony

// Update testimony (for subscribed users only)

// Delete testimony (for subscribed users only)

// Reply to testimony

// Update reply to testimony (for subscribed users only)

// Delete reply to testimony (for subscribed users only)

// Like testimony

// Unlike testimony

// Get testimony likes count

// Get whether user liked testimony

// Get replies for a testimony

// Get single reply by id

// Get replies count for a testimony

// Like reply to testimony

// Unlike reply to testimony

// Get whether user liked a reply

// Get likes count for a reply

// Get testimony analytics (views, likes, replies) - for authenticated users only

// Record a view for a testimony

// Get user's testimonies (for authenticated users only)

// Get user's replies to testimonies (for authenticated users only)

// Delete all testimonies for a user (for subscribed users only)

// Delete all replies to testimonies for a user (for subscribed users only)

// Get testimonies by tag (unauthenticated) - Would not include replies and analytics details. Would just include the count

// Get testimonies by tag (authenticated) - Would include the details of analytics (replies, etc)

// Get trending testimonies

// Get latest testimonies

// Get testimonies by type (broadcast or normal)

// Get testimonies of a specific user by user id

// Get replies of a specific user by user id

// Search testimonies by keyword

// Search testimonies by tag

// Search testimonies by type (broadcast or normal)

// Get user testimony statistics (number of testimonies, replies, likes received, views received)

// Get popular tags used in testimonies

// Get testimony length statistics (average, min, max lengths)

export default UserTestimonyRouter;
