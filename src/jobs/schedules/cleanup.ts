import { AgendaControl } from "..";
import { CRON_JOB_NAMES } from "../data";

export const CleanupCronSchedules = {
  deleteUserTestimoniesNow: async (userId: string) => {
    await AgendaControl.now(CRON_JOB_NAMES.DELETE_USER_TESTIMONIES, { userId });
  },
  deleteUserRepliesNow: async (userId: string) => {
    await AgendaControl.now(CRON_JOB_NAMES.DELETE_USER_REPLIES, { userId });
  },
  markAllConversationsReadNow: async (userId: string) => {
    await AgendaControl.now(CRON_JOB_NAMES.MARK_ALL_CONVERSATIONS_READ, {
      userId,
    });
  },
};
