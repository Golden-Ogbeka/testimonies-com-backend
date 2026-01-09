import { Router } from "express";
import { param } from "express-validator";
import { isValidObjectId } from "../../../../middleware/validation";
import { AdminPromotionController } from "../../controllers/admin/promotion";

const AdminPromotionRouter = Router();
const Controller = AdminPromotionController();

// Get all promotions (filter by active/inactive)
AdminPromotionRouter.get("/", Controller.GetAllPromotions);

// Get a single promotion by ID
AdminPromotionRouter.get(
  "/details/:id",
  param("id", "ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetSinglePromotion,
);

// Create a new promotion (this creates a promotion request for another admin's approval)
AdminPromotionRouter.post("/", Controller.CreatePromotion);

// Update an existing promotion
AdminPromotionRouter.put(
  "/:id",
  param("id", "ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.UpdatePromotion,
);

// Deactivate a promotion
AdminPromotionRouter.post(
  "/deactivate/:id",
  param("id", "ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.DeactivatePromotion,
);

// Activate a promotion
AdminPromotionRouter.post(
  "/activate/:id",
  param("id", "ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.ActivatePromotion,
);

// Delete a promotion that was created by admin (admin cannot delete user's promotion)
AdminPromotionRouter.delete(
  "/:id",
  param("id", "ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.DeleteAdminPromotion,
);

// Flag promotion
AdminPromotionRouter.post(
  "/flag/:id",
  param("id", "ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.FlagPromotion,
);

// Unflag promotion
AdminPromotionRouter.post(
  "/unflag/:id",
  param("id", "ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.UnflagPromotion,
);

// Get all flagged promotions
AdminPromotionRouter.get("/flagged", Controller.GetAllFlaggedPromotions);

// Get promotion statistics (view, clicks, conversions, etc.)
AdminPromotionRouter.get("/statistics", Controller.GetPromotionStatistics);

// Get all promotions created by users
AdminPromotionRouter.get("/user-promotions", Controller.GetUsersPromotions);

// Get all promotions created by a specific user
AdminPromotionRouter.get(
  "/user-promotions/user/:userId",
  param("userId", "User ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetSingleUserPromotions,
);

// Get all promotion requests
AdminPromotionRouter.get("/requests", Controller.GetAllPromotionRequests);

// Approve promotion request
AdminPromotionRouter.post(
  "/requests/approve/:requestID",
  param("requestID", "Request ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.ApprovePromotionRequest,
);

// Reject promotion request
AdminPromotionRouter.post(
  "/requests/reject/:requestID",
  param("requestID", "Request ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.RejectPromotionRequest,
);

// Get single promotion request by ID
AdminPromotionRouter.get(
  "/requests/details/:requestID",
  param("requestID", "Request ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetPromotionRequestDetails,
);

export default AdminPromotionRouter;
