import { AgendaControl } from "..";
import { CRON_JOB_NAMES } from "../data";

export const AnalyticsCronSchedules = {
  computeAdminAnalyticsNow: async () => {
    await AgendaControl.now(CRON_JOB_NAMES.COMPUTE_ADMIN_ANALYTICS, {});
  },
  computeUserStatsNow: async (userId: string) => {
    await AgendaControl.now(CRON_JOB_NAMES.COMPUTE_USER_STATS, { userId });
  },
};
