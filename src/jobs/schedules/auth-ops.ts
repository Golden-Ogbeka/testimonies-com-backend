import { AgendaControl } from "..";
import { CRON_JOB_NAMES } from "../data";

export const AuthOpsCronSchedules = {
  resolveIPLocationNow: async (sessionId: string, ip: string) => {
    await AgendaControl.now(CRON_JOB_NAMES.RESOLVE_IP_LOCATION, {
      sessionId,
      ip,
    });
  },
};
