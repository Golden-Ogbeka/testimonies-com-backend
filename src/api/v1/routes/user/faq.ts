import { Router } from "express";
import { query } from "express-validator";
import { UserFaqController } from "../../controllers/user/faq";

const UserFaqRouter = Router();
const Controller = UserFaqController();

// Get Active FAQs
UserFaqRouter.get(
  "/",
  [
    query("page", "Page must be a number").optional().isNumeric(),
    query("limit", "Limit must be a number").optional().isNumeric(),
  ],
  Controller.GetActiveFaqs,
);

export default UserFaqRouter;
