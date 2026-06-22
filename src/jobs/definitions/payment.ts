import Agenda from "agenda";
import axios from "axios";
import colors from "colors/safe";
import Stripe from "stripe";
import {
  FLUTTERWAVE_SECRET_KEY,
  PAYSTACK_SECRET_KEY,
  STRIPE_SECRET_KEY,
  WEBSITE_URL,
} from "../../functions/env";
import JobResultModel from "../../models/job-result.model";
import SubscriptionModel from "../../models/subscription.model";
import { CRON_JOB_NAMES } from "../data";

const stripe = new Stripe(STRIPE_SECRET_KEY as string);

export const PaymentCronDefinitions = (agenda: Agenda) => {
  agenda.define(CRON_JOB_NAMES.INIT_PAYMENT, async (job, done) => {
    try {
      const { attrs } = job;
      const data = attrs.data as {
        userId: string;
        userType: "user" | "organization";
        email: string;
        name: string;
        subscriptionId: string;
        paymentGateway: "stripe" | "paystack" | "flutterwave";
        jobToken: string;
      };

      const subscription = await SubscriptionModel.findOne({
        _id: data.subscriptionId,
        userId: data.userId,
      }).populate("planDetails");

      if (!subscription) {
        await JobResultModel.findOneAndUpdate(
          { token: data.jobToken },
          {
            status: "failed",
            errorData: { message: "Subscription not found" },
          },
        );
        done();
        return;
      }

      if (subscription.status === "active") {
        await JobResultModel.findOneAndUpdate(
          { token: data.jobToken },
          {
            status: "failed",
            errorData: { message: "Subscription is already active" },
          },
        );
        done();
        return;
      }

      const plan = subscription.planDetails as { price: number } | null;
      if (!plan || plan.price <= 0) {
        await JobResultModel.findOneAndUpdate(
          { token: data.jobToken },
          {
            status: "failed",
            errorData: { message: "Invalid plan or price" },
          },
        );
        done();
        return;
      }

      const amountToPay = plan.price;

      if (data.paymentGateway === "stripe") {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amountToPay * 100),
          currency: "usd",
          metadata: {
            subscriptionId: data.subscriptionId,
            userId: data.userId,
            userType: data.userType,
          },
        });

        subscription.paymentGateway = data.paymentGateway;
        subscription.paymentReference = paymentIntent.id;
        await subscription.save();

        await JobResultModel.findOneAndUpdate(
          { token: data.jobToken },
          {
            status: "completed",
            resultData: { clientSecret: paymentIntent.client_secret },
          },
        );

        done();
      } else if (data.paymentGateway === "paystack") {
        const response = await axios.post(
          "https://api.paystack.co/transaction/initialize",
          {
            email: data.email,
            amount: Math.round(amountToPay * 100),
            metadata: {
              subscriptionId: data.subscriptionId,
              userId: data.userId,
            },
            callback_url: `${WEBSITE_URL}/dashboard/payment/success`,
          },
          {
            headers: {
              Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
              "Content-Type": "application/json",
            },
          },
        );

        subscription.paymentGateway = data.paymentGateway;
        subscription.paymentReference = response.data.data.reference;
        await subscription.save();

        await JobResultModel.findOneAndUpdate(
          { token: data.jobToken },
          {
            status: "completed",
            resultData: {
              authorization_url: response.data.data.authorization_url,
              reference: response.data.data.reference,
            },
          },
        );

        done();
      } else if (data.paymentGateway === "flutterwave") {
        const tx_ref = `tx-${data.userId}-${Date.now()}`;
        const response = await axios.post(
          "https://api.flutterwave.com/v3/payments",
          {
            tx_ref,
            amount: amountToPay,
            currency: "USD",
            redirect_url: `${WEBSITE_URL}/dashboard/payment/success`,
            meta: {
              subscriptionId: data.subscriptionId,
              userId: data.userId,
            },
            customer: {
              email: data.email,
              name: data.name,
            },
            customizations: {
              title: "Testimonies Subscription",
            },
          },
          {
            headers: {
              Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
            },
          },
        );

        subscription.paymentGateway = data.paymentGateway;
        subscription.paymentReference = tx_ref;
        await subscription.save();

        await JobResultModel.findOneAndUpdate(
          { token: data.jobToken },
          {
            status: "completed",
            resultData: {
              link: response.data.data.link,
              tx_ref,
            },
          },
        );

        done();
      }
    } catch (error) {
      console.log("CRON:", colors.red(JSON.stringify(error)));
    }
  });
};
