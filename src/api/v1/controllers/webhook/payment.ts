import crypto from "crypto";
import { Request, Response } from "express";
import Stripe from "stripe";
import {
  FLUTTERWAVE_WEBHOOK_SECRET,
  PAYSTACK_SECRET_KEY,
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
} from "../../../../functions/env";
import { sendCatchFeedback } from "../../../../functions/feedback";
import SubscriptionModel from "../../../../models/subscription.model";

const stripe = new Stripe(STRIPE_SECRET_KEY as string);

export const WebhookController = () => {
  // Stripe Webhook
  const ConfirmStripePayment = async (
    req: Request<never, never, Stripe.EventBase>,
    res: Response,
  ) => {
    try {
      const stripeSignature = req.headers["stripe-signature"];
      let event;

      try {
        event = stripe.webhooks.constructEvent(
          req.body as any,
          stripeSignature as any,
          STRIPE_WEBHOOK_SECRET!,
        );
      } catch (err: any) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }

      const { type, data } = event;
      const paymentIntent = data.object as Stripe.PaymentIntent;

      if (type === "payment_intent.succeeded") {
        const subscriptionId = paymentIntent.metadata.subscriptionId;
        if (subscriptionId) {
          await SubscriptionModel.findByIdAndUpdate(subscriptionId, {
            status: "active",
          });
        }
      } else if (type === "payment_intent.payment_failed") {
        const subscriptionId = paymentIntent.metadata.subscriptionId;
        if (subscriptionId) {
          await SubscriptionModel.findByIdAndUpdate(subscriptionId, {
            status: "expired",
          });
        }
      }

      res.send();
    } catch (error: any) {
      console.log("Stripe Webhook Error:", error);
      return sendCatchFeedback(res, error);
    }
  };

  // Paystack Webhook
  const ConfirmPaystackPayment = async (req: Request, res: Response) => {
    try {
      const hash = crypto
        .createHmac("sha512", PAYSTACK_SECRET_KEY as string)
        .update(JSON.stringify(req.body))
        .digest("hex");

      if (hash == req.headers["x-paystack-signature"]) {
        const event = req.body;

        if (event.event === "charge.success") {
          const subscriptionId = event.data.metadata.subscriptionId;
          const status = event.data.status;

          if (subscriptionId && status === "success") {
            await SubscriptionModel.findByIdAndUpdate(subscriptionId, {
              status: "active",
            });
          }
        }
      } else {
        res.status(400).send("Invalid signature");
        return;
      }

      res.send();
    } catch (error: any) {
      console.log("Paystack Webhook Error:", error);
      return sendCatchFeedback(res, error);
    }
  };

  // Flutterwave Webhook
  const ConfirmFlutterwavePayment = async (req: Request, res: Response) => {
    try {
      const secretHash = FLUTTERWAVE_WEBHOOK_SECRET;
      const signature = req.headers["verif-hash"];

      if (!signature || signature !== secretHash) {
        res.status(401).send("Unauthorized");
        return;
      }

      const payload = req.body;

      if (
        payload.event === "charge.completed" &&
        payload.data.status === "successful"
      ) {
        const tx_ref = payload.data.tx_ref;

        // Since we stored the subscription via tx_ref as the paymentReference
        await SubscriptionModel.findOneAndUpdate(
          { paymentReference: tx_ref },
          { status: "active" },
        );
      }

      res.send();
    } catch (error: any) {
      console.log("Flutterwave Webhook Error:", error);
      return sendCatchFeedback(res, error);
    }
  };

  return {
    ConfirmStripePayment,
    ConfirmPaystackPayment,
    ConfirmFlutterwavePayment,
  };
};
