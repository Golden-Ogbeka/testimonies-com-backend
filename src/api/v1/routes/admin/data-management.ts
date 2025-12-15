import { Router } from "express";
import { param } from "express-validator";
import { isValidObjectId } from "../../../../middleware/validation";
import { AdminDataManagementController } from "../../controllers/admin/data-management";

const AdminDataManagementRouter = Router();
const Controller = AdminDataManagementController();

// Add FAQ
AdminDataManagementRouter.post("/faq", Controller.AddFAQ);

// Update FAQ
AdminDataManagementRouter.put("/faq", Controller.UpdateFAQ);

// Delete FAQ
AdminDataManagementRouter.delete("/faq", Controller.DeleteFAQ);

// Get All FAQs
AdminDataManagementRouter.get("/faq", Controller.GetAllFAQ);

// Get Single FAQ
AdminDataManagementRouter.get(
  "/faq/details/:id",
  param("id", "FAQ ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetSingleFAQ,
);

// Get Privacy Policy
AdminDataManagementRouter.get("/privacy-policy", Controller.GetPrivacyPolicy);

// Get Terms of Service
AdminDataManagementRouter.get(
  "/terms-of-service",
  Controller.GetTermsOfService,
);

// Get Community Guidelines
AdminDataManagementRouter.get(
  "/community-guidelines",
  Controller.GetCommunityGuidelines,
);

// Update Privacy Policy
AdminDataManagementRouter.put(
  "/privacy-policy",
  Controller.UpdatePrivacyPolicy,
);

// Update Terms of Service
AdminDataManagementRouter.put(
  "/terms-of-service",
  Controller.UpdateTermsOfService,
);

// Update Community Guidelines
AdminDataManagementRouter.put(
  "/community-guidelines",
  Controller.UpdateCommunityGuidelines,
);

// Create organizations' team member permissions
AdminDataManagementRouter.post(
  "/team-permissions",
  Controller.CreateTeamPermissions,
);

// Update organizations' team member permissions
AdminDataManagementRouter.put(
  "/team-permissions",
  Controller.UpdateTeamPermissions,
);

// Delete organizations' team member permissions
AdminDataManagementRouter.delete(
  "/team-permissions",
  Controller.DeleteTeamPermissions,
);

// Get organizations' team member permissions
AdminDataManagementRouter.get(
  "/team-permissions",
  Controller.GetAllTeamPermissions,
);

// Get single organization team member permissions by ID
AdminDataManagementRouter.get(
  "/team-permissions/details/:id",
  param("id", "Team Permission ID is required")
    .exists({ checkFalsy: true, checkNull: true })
    .custom((value) => isValidObjectId(value)),
  Controller.GetSingleTeamPermission,
);

export default AdminDataManagementRouter;
