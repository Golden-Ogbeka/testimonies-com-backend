import crypto from "crypto";
import { Response } from "express";
import {
  sendCatchFeedback,
  sendErrorFeedback,
  sendSuccessFeedback,
} from "../../../../functions/feedback";
import { PaymentCronSchedules } from "../../../../jobs/schedules/payment";
import JobResultModel from "../../../../models/job-result.model";
import SubscriptionPlanModel from "../../../../models/subscription-plan.model";
import SubscriptionModel from "../../../../models/subscription.model";
import { IOrganization } from "../../../../models/organization.model";
import { IUser } from "../../../../models/user.model";
import {
  AuthUserRequest,
  CustomRequest,
  PayForSubscriptionRequestBody,
  SubscribeRequestBody,
  VerifyPaymentRequestBody,
} from "../../../../types";
import { getPaginationOptions } from "../../../../utils/pagination";

export const UserSubscriptionController = () => {
  const getUserIdAndType = (req: AuthUserRequest) => {
    const user = req.user;
    const isOrg = user.accountType === "organization";
    return {
      userId: (user._id as any).toString() as string,
      userType: isOrg ? "organization" : ("user" as const),
      user,
    };
  };

  const GetSubscriptionPlans = async (req: CustomRequest, res: Response) => {
    try {
      const { page, limit } = req.query;
      const options = getPaginationOptions(
        { query: { page, limit } },
        { price: 1 },
      );

      const plans = await SubscriptionPlanModel.paginate(
        { isActive: true },
        options,
      );

      return sendSuccessFeedback(
        res,
        "Subscription plans retrieved successfully",
        {
          plans,
        },
      );
    } catch (error: unknown) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  const GetSubscriptionPlan = async (req: CustomRequest, res: Response) => {
    try {
      const plan = await SubscriptionPlanModel.findOne({
        _id: req.params.id,
        isActive: true,
      });
      if (!plan)
        return sendErrorFeedback(
          res,
          404,
          "Subscription plan not found or inactive",
        );

      return sendSuccessFeedback(res, "Subscription plan retrieved", { plan });
    } catch (error: unknown) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  const Subscribe = async (req: AuthUserRequest, res: Response) => {
    try {
      const { userId, userType } = getUserIdAndType(req);
      const { planId, autoRenew = true } = req.body as SubscribeRequestBody;

      if (!planId) return sendErrorFeedback(res, 400, "Plan ID is required");

      const plan = await SubscriptionPlanModel.findOne({
        _id: planId,
        isActive: true,
      });
      if (!plan)
        return sendErrorFeedback(res, 404, "Subscription plan not found");

      // Check for existing active subscription
      const existingSub = await SubscriptionModel.findOne({
        userId,
        status: { $in: ["active", "trial"] },
      });

      if (existingSub) {
        return sendErrorFeedback(
          res,
          409,
          "You already have an active subscription",
        );
      }

      const trialDays = plan.trialDays || 0;
      const startDate = new Date();
      let endDate = new Date(startDate);
      const trialEndDate =
        trialDays > 0
          ? new Date(startDate.getTime() + trialDays * 24 * 60 * 60 * 1000)
          : undefined;

      if (plan.billingCycle === "monthly") {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (plan.billingCycle === "yearly") {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else if (plan.billingCycle === "quarterly") {
        endDate.setMonth(endDate.getMonth() + 3);
      }

      // If trial exists, subscription only really starts post trial
      if (trialEndDate) {
        endDate = new Date(trialEndDate);
        if (plan.billingCycle === "monthly") {
          endDate.setMonth(endDate.getMonth() + 1);
        } else if (plan.billingCycle === "yearly") {
          endDate.setFullYear(endDate.getFullYear() + 1);
        } else if (plan.billingCycle === "quarterly") {
          endDate.setMonth(endDate.getMonth() + 3);
        }
      }

      const newSub = await SubscriptionModel.create({
        userId,
        userType,
        planId,
        status: trialDays > 0 ? "trial" : "pending",
        startDate,
        endDate,
        trialEndDate,
        autoRenew,
      });

      return sendSuccessFeedback(
        res,
        "Subscribed successfully",
        { subscription: newSub },
        201,
      );
    } catch (error: unknown) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  const PayForSubscription = async (req: AuthUserRequest, res: Response) => {
    try {
      const { paymentGateway, subscriptionId } =
        req.body as PayForSubscriptionRequestBody;
      const { userId, user } = getUserIdAndType(req);

      if (
        !paymentGateway ||
        !["stripe", "paystack", "flutterwave"].includes(paymentGateway)
      ) {
        return sendErrorFeedback(
          res,
          400,
          "Valid paymentGateway is required (stripe, paystack, flutterwave)",
        );
      }

      if (!subscriptionId)
        return sendErrorFeedback(res, 400, "subscriptionId is required");

      const jobToken = crypto.randomUUID();
      await JobResultModel.create({
        token: jobToken,
        type: "payment_init",
        status: "pending",
        userId,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      });

      PaymentCronSchedules.initPaymentNow({
        userId,
        userType: user.accountType === "organization" ? "organization" : "user",
        email: (user as IUser).email || (user as IOrganization).businessEmail,
        name: (user as IUser).firstName
          ? `${(user as IUser).firstName} ${(user as IUser).lastName || ""}`
          : (user as IOrganization).businessName,
        subscriptionId,
        paymentGateway,
        jobToken,
      });

      return sendSuccessFeedback(res, "Payment initialization started", {
        token: jobToken,
      });
    } catch (error: unknown) {
      console.log(error);
      return sendCatchFeedback(res, error as Error);
    }
  };

  const VerifyPayment = async (req: CustomRequest, res: Response) => {
    try {
      // Simulate verifying payment
      const { reference } = req.body as VerifyPaymentRequestBody;
      if (!reference)
        return sendErrorFeedback(res, 400, "Payment reference is required");

      return sendSuccessFeedback(res, "Payment verified successfully", {
        status: "success",
        reference,
      });
    } catch (error: unknown) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  const CancelSubscription = async (req: AuthUserRequest, res: Response) => {
    try {
      const { userId } = getUserIdAndType(req);

      const sub = await SubscriptionModel.findOneAndUpdate(
        { userId, status: { $in: ["active", "trial"] } },
        {
          status: "cancelled",
          autoRenew: false,
          cancelledAt: new Date(),
        },
        { new: true },
      );

      if (!sub)
        return sendErrorFeedback(
          res,
          404,
          "No active subscription found to cancel",
        );

      return sendSuccessFeedback(res, "Subscription cancelled successfully", {
        subscription: sub,
      });
    } catch (error: unknown) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  const GetSubscriptionStatus = async (req: AuthUserRequest, res: Response) => {
    try {
      const { userId } = getUserIdAndType(req);

      const sub = await SubscriptionModel.findOne({ userId })
        .sort({ createdAt: -1 })
        .populate("planDetails");

      if (!sub)
        return sendErrorFeedback(res, 404, "No subscription history found");

      return sendSuccessFeedback(res, "Subscription status retrieved", {
        subscription: sub,
      });
    } catch (error: unknown) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  const GetSubscriptionHistory = async (
    req: AuthUserRequest,
    res: Response,
  ) => {
    try {
      const { userId } = getUserIdAndType(req);
      const { page, limit } = req.query;

      const options = getPaginationOptions(
        { query: { page, limit } },
        { createdAt: -1 },
        [{ path: "planDetails" }],
      );

      const history = await SubscriptionModel.paginate({ userId }, options);

      return sendSuccessFeedback(res, "Subscription history retrieved", {
        history,
      });
    } catch (error: unknown) {
      return sendCatchFeedback(res, error as Error);
    }
  };

  return {
    GetSubscriptionPlans,
    GetSubscriptionPlan,
    Subscribe,
    PayForSubscription,
    VerifyPayment,
    CancelSubscription,
    GetSubscriptionStatus,
    GetSubscriptionHistory,
  };
};
