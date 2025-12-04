import { Router } from "express";
import { AdminTestimonyController } from "../../controllers/admin/testimony";

const AdminTestimonyRouter = Router();
const Controller = AdminTestimonyController();

// Get testimonies with highest engagement (likes + replies + views)

// Get testimonies with highest likes

// Get testimonies with highest replies

// Get testimonies with highest views

// Get most active users (users with most testimonies created)

// Get most engaged users (users with most replies made)

// Get most liked users (users whose testimonies received the most likes)

// Get most viewed users (users whose testimonies received the most views)

// Flag testimony

// Review flagged testimony

// Get all flagged testimonies

// View single testimony by id

// Get all testimonies

export default AdminTestimonyRouter;
