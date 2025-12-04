import { Router } from "express";
import { UserAnalyticsController } from "../../controllers/user/analytics";

const UserAnalyticsRouter = Router();
const Controller = UserAnalyticsController();

// Get testimony activity over time (number of testimonies created per day/week/month)

// Get reply activity over time (number of replies created per day/week/month)

// Get like activity over time (number of likes given per day/week/month)

// Get view activity over time (number of views recorded per day/week/month)

// Get user engagement statistics (average likes, replies, views per testimony)

// Get team analytics summary (total testimonies, replies, likes, views)

// Get top testimonies by views

// Get top testimonies by likes

// Get top testimonies by replies

// Get team analytics of single team member

export default UserAnalyticsRouter;
