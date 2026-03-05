import { Response } from "express";
import { validationResult } from "express-validator";
import { getAdminUserDetails } from "../../../../functions/auth";
import {
  sendCatchFeedback,
  sendErrorFeedback,
  sendSuccessFeedback,
  sendValidationErrorFeedback,
} from "../../../../functions/feedback";
import OrganizationModel from "../../../../models/organization.model";
import SubscriptionPlanModel from "../../../../models/subscription-plan.model";
import SubscriptionModel from "../../../../models/subscription.model";
import UserModel from "../../../../models/user.model";
import { CustomRequest } from "../../../../types/express";
import {
  ExtendSubscriptionRequestBody,
  IdParams,
  PaginationQuery,
  SubscriptionIdParams,
  SubscriptionPlanCreateRequestBody,
  SubscriptionPlanUpdateRequestBody,
  UserIdParams,
} from "../../../../types/requests";
import { getPaginationOptions } from "../../../../utils/pagination";

export const AdminSubscriptionController = () => {
  const GetAllPlans = async (
    req: CustomRequest<never, any, any, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { isActive, billingCycle } = req.query as any;

      // Build filter
      const filter: Record<string, any> = {};
      if (isActive !== undefined) filter.isActive = isActive === "true";
      if (billingCycle) filter.billingCycle = billingCycle;

      const paginationOptions = getPaginationOptions(req);

      const plans = await SubscriptionPlanModel.paginate(filter, {
        ...paginationOptions,
        sort: { price: 1, name: 1 },
      });

      return sendSuccessFeedback(res, "Subscription plans retrieved", {
        plans,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const CreatePlan = async (
    req: CustomRequest<never, any, SubscriptionPlanCreateRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const {
        name,
        description,
        price,
        currency,
        billingCycle,
        features,
        trialDays,
        maxUsers,
        maxTestimonies,
      } = req.body;

      const adminDetails = await getAdminUserDetails(req);

      // Check if plan with same name already exists
      const existingPlan = await SubscriptionPlanModel.findOne({ name });
      if (existingPlan) {
        return sendErrorFeedback(
          res,
          409,
          "Subscription plan with this name already exists",
        );
      }

      const plan = await SubscriptionPlanModel.create({
        name,
        description,
        price,
        currency: currency || "NGN",
        billingCycle,
        features: features || [],
        trialDays,
        maxUsers,
        maxTestimonies,
        createdBy: adminDetails._id,
      });

      return sendSuccessFeedback(
        res,
        "Subscription plan created successfully",
        { plan },
      );
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const UpdatePlan = async (
    req: CustomRequest<IdParams, any, SubscriptionPlanUpdateRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);
      const adminDetails = await getAdminUserDetails(req);

      const { id } = req.params;
      const {
        name,
        description,
        price,
        currency,
        billingCycle,
        features,
        isActive,
        trialDays,
        maxUsers,
        maxTestimonies,
      } = req.body;

      const plan = await SubscriptionPlanModel.findById(id);
      if (!plan) {
        return sendErrorFeedback(res, 404, "Subscription plan not found");
      }

      // Check if another plan with same name exists
      if (name && name !== plan.name) {
        const existingPlan = await SubscriptionPlanModel.findOne({
          name,
          _id: { $ne: id },
        });
        if (existingPlan) {
          return sendErrorFeedback(
            res,
            409,
            "Subscription plan with this name already exists",
          );
        }
      }

      const updateData: Record<string, any> = {};
      if (name) updateData.name = name;
      if (description) updateData.description = description;
      if (price !== undefined) updateData.price = price;
      if (currency) updateData.currency = currency;
      if (billingCycle) updateData.billingCycle = billingCycle;
      if (features !== undefined) updateData.features = features;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (trialDays !== undefined) updateData.trialDays = trialDays;
      if (maxUsers !== undefined) updateData.maxUsers = maxUsers;
      if (maxTestimonies !== undefined)
        updateData.maxTestimonies = maxTestimonies;
      updateData.updatedBy = adminDetails._id;

      const updatedPlan = await SubscriptionPlanModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true },
      );

      return sendSuccessFeedback(
        res,
        "Subscription plan updated successfully",
        { plan: updatedPlan },
      );
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };
  const DeactivatePlan = async (
    req: CustomRequest<IdParams>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;
      const adminDetails = await getAdminUserDetails(req);

      const plan = await SubscriptionPlanModel.findByIdAndUpdate(
        id,
        {
          isActive: false,
          updatedBy: adminDetails._id,
        },
        { new: true },
      );

      if (!plan) {
        return sendErrorFeedback(res, 404, "Subscription plan not found");
      }
      return sendSuccessFeedback(
        res,
        "Subscription plan deactivated successfully",
        { plan },
      );
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };
  const ActivatePlan = async (req: CustomRequest<IdParams>, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;
      const adminDetails = await getAdminUserDetails(req);

      const plan = await SubscriptionPlanModel.findByIdAndUpdate(
        id,
        {
          isActive: true,
          updatedBy: adminDetails._id,
        },
        { new: true },
      );
      if (!plan) {
        return sendErrorFeedback(res, 404, "Subscription plan not found");
      }
      return sendSuccessFeedback(
        res,
        "Subscription plan activated successfully",
      );
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetSinglePlan = async (req: CustomRequest<IdParams>, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const plan = await SubscriptionPlanModel.findById(id);
      if (!plan) {
        return sendErrorFeedback(res, 404, "Subscription plan not found");
      }

      return sendSuccessFeedback(res, "Subscription plan retrieved", { plan });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const DeletePlan = async (req: CustomRequest<IdParams>, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const plan = await SubscriptionPlanModel.findById(id);
      if (!plan) {
        return sendErrorFeedback(res, 404, "Subscription plan not found");
      }

      // Check if plan is being used by any subscriptions
      const activeSubscriptions = await SubscriptionModel.countDocuments({
        planId: id,
        status: "active",
      });
      if (activeSubscriptions > 0) {
        return sendErrorFeedback(
          res,
          400,
          "Cannot delete plan that is being used by active subscriptions",
        );
      }

      await SubscriptionPlanModel.findByIdAndDelete(id);

      return sendSuccessFeedback(res, "Subscription plan deleted successfully");
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetPlanSubscribedUsers = async (
    req: CustomRequest<IdParams, any, any, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const paginationOptions = getPaginationOptions(req);

      const subscriptions = await SubscriptionModel.paginate(
        { planId: id, status: "active" },
        {
          ...paginationOptions,
          sort: { createdAt: -1 },
          populate: ["userDetails"],
        },
      );

      return sendSuccessFeedback(res, "Plan subscribed users retrieved", {
        subscriptions,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetPlanStatistics = async (
    req: CustomRequest<IdParams>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const totalSubscriptions = await SubscriptionModel.countDocuments({
        planId: id,
      });
      const activeSubscriptions = await SubscriptionModel.countDocuments({
        planId: id,
        status: "active",
      });
      const cancelledSubscriptions = await SubscriptionModel.countDocuments({
        planId: id,
        status: "cancelled",
      });
      const trialSubscriptions = await SubscriptionModel.countDocuments({
        planId: id,
        status: "trial",
      });

      return sendSuccessFeedback(res, "Plan statistics retrieved", {
        totalSubscriptions,
        activeSubscriptions,
        cancelledSubscriptions,
        trialSubscriptions,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const ExtendSubscription = async (
    req: CustomRequest<
      SubscriptionIdParams,
      any,
      ExtendSubscriptionRequestBody
    >,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { subscriptionId } = req.params;
      const { days } = req.body;

      // Validate days
      if (days <= 0) {
        return sendErrorFeedback(res, 400, "Days must be a positive number");
      }

      const subscription = await SubscriptionModel.findById(subscriptionId);
      if (!subscription) {
        return sendErrorFeedback(res, 404, "Subscription not found");
      }

      // Check if subscription is expired
      if (subscription.status === "expired") {
        return sendErrorFeedback(
          res,
          400,
          "Cannot extend an expired subscription. Please renew instead.",
        );
      }

      // Extend subscription
      const newEndDate = new Date(subscription.endDate);
      newEndDate.setDate(newEndDate.getDate() + (days || 30));

      await SubscriptionModel.findByIdAndUpdate(subscriptionId, {
        endDate: newEndDate,
      });

      return sendSuccessFeedback(res, "Subscription extended successfully");
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetUserSubscription = async (
    req: CustomRequest<UserIdParams>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { userId } = req.params;

      const subscription = await SubscriptionModel.findOne({ userId }).populate(
        ["planDetails", "userDetails"],
      );

      if (!subscription) {
        return sendErrorFeedback(res, 404, "User subscription not found");
      }

      return sendSuccessFeedback(res, "User subscription retrieved", {
        subscription,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetActiveSubscriptions = async (
    req: CustomRequest<never, any, any, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const paginationOptions = getPaginationOptions(req);

      const subscriptions = await SubscriptionModel.paginate(
        { status: "active" },
        {
          ...paginationOptions,
          sort: { createdAt: -1 },
          populate: ["userDetails", "planDetails"],
        },
      );

      return sendSuccessFeedback(res, "Active subscriptions retrieved", {
        subscriptions,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetCancelledSubscriptions = async (
    req: CustomRequest<never, any, any, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const paginationOptions = getPaginationOptions(req);

      const subscriptions = await SubscriptionModel.paginate(
        { status: "cancelled" },
        {
          ...paginationOptions,
          sort: { cancelledAt: -1 },
          populate: ["userDetails", "planDetails"],
        },
      );

      return sendSuccessFeedback(res, "Cancelled subscriptions retrieved", {
        subscriptions,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetUnsubscribedUsers = async (
    req: CustomRequest<never, any, any, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      // Get users who have no active subscription
      const usersWithSubscriptions = await SubscriptionModel.distinct(
        "userId",
        { status: "active" },
      );

      const paginationOptions = getPaginationOptions(req);

      const users = await UserModel.paginate(
        { _id: { $nin: usersWithSubscriptions } },
        {
          ...paginationOptions,
          sort: { createdAt: -1 },
          select: "firstName lastName email username profileImage",
        },
      );

      // Organizations
      const organizations = await OrganizationModel.paginate(
        { _id: { $nin: usersWithSubscriptions } },

        {
          ...paginationOptions,
          sort: { createdAt: -1 },
          select: "name email username profileImage",
        },
      );

      return sendSuccessFeedback(res, "Unsubscribed users retrieved", {
        users,
        organizations,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  return {
    GetAllPlans,
    CreatePlan,
    UpdatePlan,
    DeactivatePlan,
    ActivatePlan,
    GetSinglePlan,
    DeletePlan,
    GetPlanSubscribedUsers,
    GetPlanStatistics,
    ExtendSubscription,
    GetUserSubscription,
    GetActiveSubscriptions,
    GetCancelledSubscriptions,
    GetUnsubscribedUsers,
  };
};
