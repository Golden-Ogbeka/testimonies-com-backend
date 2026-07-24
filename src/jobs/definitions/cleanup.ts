import Agenda from "agenda";
import colors from "colors/safe";
import ConversationModel from "../../models/conversation.model";
import MessageModel from "../../models/message.model";
import TestimonyModel from "../../models/testimony.model";
import TestimonyReplyModel from "../../models/testimony-reply.model";
import { CRON_JOB_NAMES } from "../data";

type DeleteUserContentJobData = {
  userId: string;
};

type MarkConversationsReadJobData = {
  userId: string;
};

export const CleanupCronDefinitions = (agenda: Agenda) => {
  agenda.define(CRON_JOB_NAMES.DELETE_USER_TESTIMONIES, async (job, done) => {
    try {
      const { attrs } = job;
      const data = attrs.data as DeleteUserContentJobData;

      await TestimonyModel.updateMany(
        { userId: data.userId, isDeleted: false },
        { isDeleted: true, deletedAt: new Date() },
      );

      done();
    } catch (error) {
      console.log("CRON:", colors.red(JSON.stringify(error)));
    }
  });

  agenda.define(CRON_JOB_NAMES.DELETE_USER_REPLIES, async (job, done) => {
    try {
      const { attrs } = job;
      const data = attrs.data as DeleteUserContentJobData;

      await TestimonyReplyModel.updateMany(
        { userId: data.userId, isDeleted: false },
        { isDeleted: true, deletedAt: new Date() },
      );

      done();
    } catch (error) {
      console.log("CRON:", colors.red(JSON.stringify(error)));
    }
  });

  agenda.define(
    CRON_JOB_NAMES.MARK_ALL_CONVERSATIONS_READ,
    async (job, done) => {
      try {
        const { attrs } = job;
        const data = attrs.data as MarkConversationsReadJobData;

        const conversations = await ConversationModel.find({
          "participants.userId": data.userId,
        });
        const conversationIds = conversations.map((c) => c._id);

        await MessageModel.updateMany(
          {
            conversationId: { $in: conversationIds },
            senderId: { $ne: data.userId },
            isRead: false,
          },
          { isRead: true, readAt: new Date() },
        );

        for (const conv of conversations) {
          conv.unreadCount.set(data.userId.toString(), 0);
          await conv.save();
        }

        done();
      } catch (error) {
        console.log("CRON:", colors.red(JSON.stringify(error)));
      }
    },
  );
};
