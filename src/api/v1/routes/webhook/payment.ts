import express, { Router } from "express";
import { WebhookController } from "../../controllers/webhook/payment";

const PaymentWebhookRouter = Router();

const Controller = WebhookController();

// Stripe requires raw body to construct the event
PaymentWebhookRouter.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  Controller.ConfirmStripePayment,
);

PaymentWebhookRouter.post("/paystack", Controller.ConfirmPaystackPayment);

PaymentWebhookRouter.post("/flutterwave", Controller.ConfirmFlutterwavePayment);

export default PaymentWebhookRouter;
