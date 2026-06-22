import { AgendaControl } from "..";
import { CRON_JOB_NAMES } from "../data";

type SMSOptions = {
  to: string;
  message: string;
  provider: "twilio" | "termii";
  from?: string;
};

export const CommunicationCronSchedules = {
  sendSMSNow: async (data: SMSOptions) => {
    await AgendaControl.now(CRON_JOB_NAMES.SEND_SMS, data);
  },
};
