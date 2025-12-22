import { Router } from "express";
import { param } from "express-validator";
import { isValidObjectId } from "../../../../middleware/validation";
import { UserPromotionController } from "../../controllers/user/promotion";

const UserPromotionRouter = Router();
const Controller = UserPromotionController();

// Get all promotions (filter by active/inactive)
UserPromotionRouter.get("/", Controller.GetAllPromotions);

// Get a single promotion by ID
UserPromotionRouter.get(
  "/:id",
  param("id", "Promotion ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetPromotion,
);

// Create a new promotion (this submits a promotion request for admin approval)
UserPromotionRouter.post("/", Controller.CreatePromotion);

// Update an existing promotion
UserPromotionRouter.put(
  "/:id",
  param("id", "Promotion ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.UpdatePromotion,
);

// Deactivate a promotion
UserPromotionRouter.post(
  "/:id/deactivate",
  param("id", "Promotion ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.DeactivatePromotion,
);

// Activate a promotion
UserPromotionRouter.post(
  "/:id/activate",
  param("id", "Promotion ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.ActivatePromotion,
);

// Delete a promotion created by the user
UserPromotionRouter.delete(
  "/:id",
  param("id", "Promotion ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.DeletePromotion,
);

// View promotion requests
UserPromotionRouter.get("/requests/all", Controller.GetPromotionRequests);

// Delete promotion request
UserPromotionRouter.delete(
  "/requests/:id",
  param("id", "Request ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.DeletePromotionRequest,
);

// Get user's promotion statistics (views, clicks, conversions, etc.)
UserPromotionRouter.get("/stats/user", Controller.GetPromotionStats);

// Get a promotion to view for advertising
UserPromotionRouter.get("/view/ad", Controller.GetPromotionForAd);

export default UserPromotionRouter;
