import { AgendaControl } from "..";
import { DEFAULT_JOB_TIMER, OTP_EXPIRY } from "../../functions/env";
import { CRON_JOB_NAMES } from "../data";

export const UserCronSchedules = {
  resetOTP: async (email: string) => {
    await AgendaControl.schedule(
      OTP_EXPIRY!,
      CRON_JOB_NAMES.RESET_USER_VERIFICATION_CODE,
      {
        email,
      },
    );
  },
  resetTriedSignup: async (email: string) => {
    await AgendaControl.schedule(
      DEFAULT_JOB_TIMER!,
      CRON_JOB_NAMES.RESET_TRIED_SIGNUP_STATUS,
      {
        email,
      },
    );
  },
  resetTriedLogin: async (email: string) => {
    await AgendaControl.schedule(
      DEFAULT_JOB_TIMER!,
      CRON_JOB_NAMES.RESET_TRIED_LOGIN_STATUS,
      {
        email,
      },
    );
  },
  resetTriedPasswordReset: async (email: string) => {
    await AgendaControl.schedule(
      DEFAULT_JOB_TIMER!,
      CRON_JOB_NAMES.RESET_TRIED_PASSWORD_RESET_STATUS,
      {
        email,
      },
    );
  },
};
