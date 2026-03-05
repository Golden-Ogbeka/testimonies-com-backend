import { Router } from "express";
import { body, param, query } from "express-validator";
import { AdminFaqController } from "../../controllers/admin/faq";

const AdminFaqRouter = Router();
const Controller = AdminFaqController();

// Create FAQ
AdminFaqRouter.post(
  "/",
  [
    body("question", "Question is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 5 })
      .withMessage("Question must be at least 5 characters long"),
    body("answer", "Answer is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim()
      .isLength({ min: 5 })
      .withMessage("Answer must be at least 5 characters long"),
    body("order", "Order must be a number").optional().isNumeric(),
  ],
  Controller.CreateFaq,
);

// Get FAQs
AdminFaqRouter.get(
  "/",
  [
    query("page", "Page must be a number").optional().isNumeric(),
    query("limit", "Limit must be a number").optional().isNumeric(),
  ],
  Controller.GetFaqs,
);

// Update FAQ
AdminFaqRouter.put(
  "/:id",
  [
    param("id", "Invalid FAQ ID").isMongoId(),
    body("question", "Question must be at least 5 characters long")
      .optional()
      .trim()
      .isLength({ min: 5 }),
    body("answer", "Answer must be at least 5 characters long")
      .optional()
      .trim()
      .isLength({ min: 5 }),
    body("order", "Order must be a number").optional().isNumeric(),
  ],
  Controller.UpdateFaq,
);

// Toggle FAQ Status
AdminFaqRouter.patch(
  "/:id/status",
  [
    param("id", "Invalid FAQ ID").isMongoId(),
    body("isActive", "isActive boolean is required").isBoolean(),
  ],
  Controller.ToggleFaqStatus,
);

// Delete FAQ
AdminFaqRouter.delete(
  "/:id",
  [param("id", "Invalid FAQ ID").isMongoId()],
  Controller.DeleteFaq,
);

export default AdminFaqRouter;
