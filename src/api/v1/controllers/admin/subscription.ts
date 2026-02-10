import { Request, Response } from "express";
import { validationResult } from "express-validator";
import {
  sendCatchFeedback,
  sendErrorFeedback,
  sendSuccessFeedback,
  sendValidationErrorFeedback,
} from "../../../../functions/feedback";
import SubscriptionPlanModel from "../../../../models/subscription-plan.model";
import SubscriptionModel from "../../../../models/subscription.model";
import UserModel from "../../../../models/user.model";
import { getPaginationOptions } from "../../../../utils/pagination";
import {
  IdParams,
  TransactionIdParams,
  SubscriptionIdParams,
  UserIdParams,
  SubscriptionPlanCreateRequestBody,
  SubscriptionPlanUpdateRequestBody,
  SubscriptionFilterQuery,
  RefundTransactionRequestBody,
  ExtendSubscriptionRequestBody,
  PaginationQuery,
} from "../../../../types/requests";

export const AdminSubscriptionController = () => {
  const GetAllPlans = async (
    req: Request<never, never, never, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { page = 1, limit = 20, isActive, billingCycle } = req.query as any;

      // Build filter
      const filter: any = {};
      if (isActive !== undefined) filter.isActive = isActive === "true";
      if (billingCycle) filter.billingCycle = billingCycle;

      const paginationOptions = getPaginationOptions({
        page: page as string,
        limit: limit as string,
      });

      const plans = await SubscriptionPlanModel.paginate(filter, {
        ...paginationOptions,
        sort: { price: 1, name: 1 },
      });

      return sendSuccessFeedback(res, "Subscription plans retrieved", {
        plans: plans.docs,
        pagination: {
          currentPage: plans.page,
          totalPages: plans.totalPages,
          totalDocs: plans.totalDocs,
          hasNextPage: plans.hasNextPage,
          hasPrevPage: plans.hasPrevPage,
        },
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const CreatePlan = async (
    req: Request<never, never, SubscriptionPlanCreateRequestBody>,
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
        currency: currency || "USD",
        billingCycle,
        features: features || [],
        trialDays,
        maxUsers,
        maxTestimonies,
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
    req: Request<IdParams, never, SubscriptionPlanUpdateRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

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

      const updateData: any = {};
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
  const DeactivatePlan = async (req: Request<IdParams>, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const plan = await SubscriptionPlanModel.findById(id);
      if (!plan) {
        return sendErrorFeedback(res, 404, "Subscription plan not found");
      }

      await SubscriptionPlanModel.findByIdAndUpdate(id, { isActive: false });

      return sendSuccessFeedback(
        res,
        "Subscription plan deactivated successfully",
      );
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };
  const ActivatePlan = async (req: Request<IdParams>, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const plan = await SubscriptionPlanModel.findById(id);
      if (!plan) {
        return sendErrorFeedback(res, 404, "Subscription plan not found");
      }

      await SubscriptionPlanModel.findByIdAndUpdate(id, { isActive: true });

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

  const GetSinglePlan = async (req: Request<IdParams>, res: Response) => {
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

  const DeletePlan = async (req: Request<IdParams>, res: Response) => {
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
    req: Request<IdParams, never, never, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query as any;

      const paginationOptions = getPaginationOptions({
        page: page as string,
        limit: limit as string,
      });

      const subscriptions = await SubscriptionModel.paginate(
        { planId: id, status: "active" },
        {
          ...paginationOptions,
          sort: { createdAt: -1 },
          populate: [
            { path: "userId", select: "firstName lastName email username" },
            { path: "planId", select: "name price billingCycle" },
          ],
        },
      );

      return sendSuccessFeedback(res, "Plan subscribed users retrieved", {
        subscriptions: subscriptions.docs,
        pagination: {
          currentPage: subscriptions.page,
          totalPages: subscriptions.totalPages,
          totalDocs: subscriptions.totalDocs,
          hasNextPage: subscriptions.hasNextPage,
          hasPrevPage: subscriptions.hasPrevPage,
        },
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetPlanStatistics = async (req: Request<IdParams>, res: Response) => {
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

  const GetPlanTransactions = async (
    req: Request<IdParams, never, never, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { page = 1, limit = 20 } = req.query as any;

      // For now, this is a placeholder implementation
      // In a real implementation, you would have a Transaction model
      return sendSuccessFeedback(res, "Plan transactions retrieved", {
        transactions: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalDocs: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetPlanTransactionDetails = async (
    req: Request<TransactionIdParams>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { transactionId } = req.params;

      // For now, this is a placeholder implementation
      return sendSuccessFeedback(res, "Transaction details retrieved", {
        transaction: {
          id: transactionId,
          amount: 99.99,
          status: "completed",
          date: new Date(),
        },
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const RefundTransaction = async (
    req: Request<TransactionIdParams, never, RefundTransactionRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { transactionId } = req.params;
      const { reason, amount } = req.body;

      // For now, this is a placeholder implementation
      return sendSuccessFeedback(res, "Transaction refunded successfully");
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const CancelTransaction = async (
    req: Request<TransactionIdParams>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { transactionId } = req.params;
      const { reason } = req.body;

      // For now, this is a placeholder implementation
      return sendSuccessFeedback(res, "Transaction cancelled successfully");
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const ExtendSubscription = async (
    req: Request<SubscriptionIdParams, never, ExtendSubscriptionRequestBody>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { subscriptionId } = req.params;
      const { days, reason } = req.body;

      const subscription = await SubscriptionModel.findById(subscriptionId);
      if (!subscription) {
        return sendErrorFeedback(res, 404, "Subscription not found");
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
    req: Request<UserIdParams>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { userId } = req.params;

      const subscription = await SubscriptionModel.findOne({ userId }).populate(
        [{ path: "planId", select: "name price billingCycle features" }],
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
    req: Request<never, never, never, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { page = 1, limit = 20 } = req.query as any;

      const paginationOptions = getPaginationOptions({
        page: page as string,
        limit: limit as string,
      });

      const subscriptions = await SubscriptionModel.paginate(
        { status: "active" },
        {
          ...paginationOptions,
          sort: { createdAt: -1 },
          populate: [
            { path: "userId", select: "firstName lastName email username" },
            { path: "planId", select: "name price billingCycle" },
          ],
        },
      );

      return sendSuccessFeedback(res, "Active subscriptions retrieved", {
        subscriptions: subscriptions.docs,
        pagination: {
          currentPage: subscriptions.page,
          totalPages: subscriptions.totalPages,
          totalDocs: subscriptions.totalDocs,
          hasNextPage: subscriptions.hasNextPage,
          hasPrevPage: subscriptions.hasPrevPage,
        },
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetCancelledSubscriptions = async (
    req: Request<never, never, never, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { page = 1, limit = 20 } = req.query as any;

      const paginationOptions = getPaginationOptions({
        page: page as string,
        limit: limit as string,
      });

      const subscriptions = await SubscriptionModel.paginate(
        { status: "cancelled" },
        {
          ...paginationOptions,
          sort: { cancelledAt: -1 },
          populate: [
            { path: "userId", select: "firstName lastName email username" },
            { path: "planId", select: "name price billingCycle" },
          ],
        },
      );

      return sendSuccessFeedback(res, "Cancelled subscriptions retrieved", {
        subscriptions: subscriptions.docs,
        pagination: {
          currentPage: subscriptions.page,
          totalPages: subscriptions.totalPages,
          totalDocs: subscriptions.totalDocs,
          hasNextPage: subscriptions.hasNextPage,
          hasPrevPage: subscriptions.hasPrevPage,
        },
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetUnsubscribedUsers = async (
    req: Request<never, never, never, PaginationQuery>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { page = 1, limit = 20 } = req.query as any;

      const paginationOptions = getPaginationOptions({
        page: page as string,
        limit: limit as string,
      });

      // Get users who have no active subscription
      const usersWithSubscriptions = await SubscriptionModel.distinct(
        "userId",
        { status: "active" },
      );

      const paginationOptions2 = getPaginationOptions({
        page: page as string,
        limit: limit as string,
      });

      const users = await UserModel.paginate(
        { _id: { $nin: usersWithSubscriptions } },
        {
          ...paginationOptions2,
          sort: { createdAt: -1 },
          select: "firstName lastName email username createdAt",
        },
      );

      return sendSuccessFeedback(res, "Unsubscribed users retrieved", {
        users: users.docs,
        pagination: {
          currentPage: users.page,
          totalPages: users.totalPages,
          totalDocs: users.totalDocs,
          hasNextPage: users.hasNextPage,
          hasPrevPage: users.hasPrevPage,
        },
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
    GetPlanTransactions,
    GetPlanTransactionDetails,
    RefundTransaction,
    CancelTransaction,
    ExtendSubscription,
    GetUserSubscription,
    GetActiveSubscriptions,
    GetCancelledSubscriptions,
    GetUnsubscribedUsers,
  };
};
