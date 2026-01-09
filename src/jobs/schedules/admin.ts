import { AgendaControl } from "..";
import { OTP_EXPIRY } from "../../functions/env";
import { CRON_JOB_NAMES } from "../data";

export const AdminCronSchedules = {
  resetOTP: async (email: string) => {
    await AgendaControl.schedule(
      OTP_EXPIRY!,
      CRON_JOB_NAMES.RESET_ADMIN_VERIFICATION_CODE,
      {
        email,
      },
    );
  },
};
