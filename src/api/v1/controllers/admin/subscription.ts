import { Request, Response } from "express";
import { sendCatchFeedback } from "../../../../functions/feedback";

export const AdminSubscriptionController = () => {
  const GetAllPlans = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const CreatePlan = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const UpdatePlan = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };
  const DeactivatePlan = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };
  const ActivatePlan = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const GetSinglePlan = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const DeletePlan = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const GetPlanSubscribedUsers = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const GetPlanStatistics = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const GetPlanTransactions = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const GetPlanTransactionDetails = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const RefundTransaction = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const CancelTransaction = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const ExtendSubscription = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const GetUserSubscription = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const GetActiveSubscriptions = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const GetCancelledSubscriptions = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const GetUnsubscribedUsers = async (req: Request, res: Response) => {
    try {
      // check for validation errors
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
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
