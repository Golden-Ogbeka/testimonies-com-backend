import Agenda from "agenda";
import colors from "colors/safe";
import {
  sendMessageFromTwilio,
  sendTextMessage,
} from "../../functions/text-message";
import { CRON_JOB_NAMES } from "../data";

type SMSJobData = {
  to: string;
  message: string;
  provider: "twilio" | "termii";
  from?: string;
};

export const CommunicationCronDefinitions = (agenda: Agenda) => {
  agenda.define(CRON_JOB_NAMES.SEND_SMS, async (job, done) => {
    try {
      const { attrs } = job;
      const data = attrs.data as SMSJobData;

      if (data.provider === "twilio") {
        await sendMessageFromTwilio(data.to, data.message, data.from);
      } else {
        await sendTextMessage(data.to, data.message, "generic", data.from);
      }

      done();
    } catch (error) {
      console.log("CRON:", colors.red(JSON.stringify(error)));
    }
  });
};
