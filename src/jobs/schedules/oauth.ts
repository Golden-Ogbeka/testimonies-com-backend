import { AgendaControl } from "..";
import { CRON_JOB_NAMES } from "../data";

export const OAuthCronSchedules = {
  processGoogleOAuthNow: async (data: {
    code: string;
    ip: string;
    userAgent: string;
    jobToken: string;
  }) => {
    await AgendaControl.now(CRON_JOB_NAMES.PROCESS_GOOGLE_OAUTH, data);
  },
};
