import { AgendaControl } from "..";
import { CRON_JOB_NAMES } from "../data";

export const PaymentCronSchedules = {
  initPaymentNow: async (data: {
    userId: string;
    userType: "user" | "organization";
    email: string;
    name: string;
    subscriptionId: string;
    paymentGateway: "stripe" | "paystack" | "flutterwave";
    jobToken: string;
  }) => {
    await AgendaControl.now(CRON_JOB_NAMES.INIT_PAYMENT, data);
  },
};
