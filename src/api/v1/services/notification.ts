import { IAdmin } from "../../../models/admin.model";
import { IOrganization } from "../../../models/organization.model";
import { IUser } from "../../../models/user.model";
import { EmailAttachmentType } from "../../../types";
import { NotificationType, PushNotificationType } from "../../../types/data";
import { sendEmail } from "../../../utils/mailer";

// --- Type definitions ---

type BaseNotifyUserProps = {
  sendInAppNotification?: boolean;
  sendPushNotification?: boolean;
  sendEmailNotification?: boolean;
  userDetails?: IUser | IOrganization | IAdmin;
  title: string;
  message: string;
  emailAttachment?: EmailAttachmentType;
} & Partial<NotificationType> &
  Partial<PushNotificationType>;

// Single-user variant
type NotifyUserSingle = {
  isMultiple?: false;
  multipleUsers?: never;
} & BaseNotifyUserProps;

// Multi-user variant
type NotifyUserMultiple = {
  isMultiple: true;
  multipleUsers: IUser[] | IOrganization[] | IAdmin[];
} & BaseNotifyUserProps;

// --- Helper functions ---

const getUserEmail = (
  user: IUser | IOrganization | IAdmin,
): string | undefined => {
  if ("email" in user) return user.email;
  if ("businessEmail" in user) return user.businessEmail;
  return undefined;
};

const getUserName = (user: IUser | IOrganization | IAdmin): string => {
  if ("firstName" in user) return user.firstName;
  if ("businessName" in user) return user.businessName;
  const emailUser = user as IUser | IOrganization | IAdmin;
  if ("email" in emailUser) return emailUser.email;
  if ("businessEmail" in emailUser) return emailUser.businessEmail;
  return "User";
};

const _getUserId = (
  user?: IUser | IOrganization | IAdmin,
  fallback?: string,
) => {
  if (!user) return fallback;
  return "_id" in user ? user._id : fallback;
};

const _getUserNtfToken = (
  user?: IUser | IOrganization | IAdmin,
  fallback?: string,
) => {
  if (!user) return fallback ?? "";
  return "ntfToken" in user ? user.ntfToken || "" : (fallback ?? "");
};

// --- Main function ---

export const notifyUser = async (
  props: NotifyUserSingle | NotifyUserMultiple,
): Promise<void> => {
  const {
    sendEmailNotification,
    title,
    message,
    emailAttachment,
    userDetails,
    isMultiple = false,
    multipleUsers = [],
  } = props;

  // --- Email Notifications ---
  if (sendEmailNotification) {
    if (isMultiple) {
      // Multiple users
      for (const user of multipleUsers) {
        const email = getUserEmail(user);
        if (!email) continue;

        await sendEmail({
          recipient: email,
          subject: title,
          email: message,
          username: getUserName(user),
          attachmentDetails: emailAttachment,
        });
      }
    } else if (userDetails) {
      const email = getUserEmail(userDetails);
      if (email) {
        await sendEmail({
          recipient: email,
          subject: title,
          email: message,
          username: getUserName(userDetails),
          attachmentDetails: emailAttachment,
        });
      }
    }
  }

  // // --- In-App Notifications ---
  // if (sendInAppNotification && userId) {
  //   await UserCronSchedules.sendNotification({
  //     userId: userId as Types.ObjectId,
  //     title,
  //     teamId: notificationProps.teamId,
  //     message,
  //     type: notificationProps.type || "general-notification",
  //     adminId: notificationProps.adminId,
  //     scheduleId: notificationProps.scheduleId,
  //     scheduleTimesheetDetails: notificationProps.scheduleTimesheetDetails,
  //     clockOutAdminId: notificationProps.clockOutAdminId,
  //     rewardId: notificationProps.rewardId,
  //     sentBy: notificationProps.sentBy ?? "app",
  //     teamRequestId: notificationProps.teamRequestId,
  //   });
  // }

  // // --- Push Notifications ---
  // if (sendPushNotification) {
  //   if (isMultiple) {
  //     await sendPushNotificationToMultipleUsers(
  //       multipleUsers.map((user) => ({
  //         userId: user._id,
  //         teamId: user.teamId,
  //         title,
  //         // Remove HTML tags from message for push notifications
  //         message:
  //           typeof message === "string"
  //             ? message.replace(/<\/?[^>]+(>|$)/g, "")
  //             : "",
  //         userNtfToken: user.ntfToken || "",
  //         sentBy: notificationProps.sentBy ?? "app",
  //         adminId: notificationProps.adminId,
  //         data: notificationProps.data,
  //       })),
  //     );
  //   } else if (userId) {
  //     await sendPushNotificationToUser({
  //       userId,
  //       title,
  //       teamId: notificationProps.teamId,
  //       // Remove HTML tags from message for in-app notifications
  //       message:
  //         typeof message === "string"
  //           ? message.replace(/<\/?[^>]+(>|$)/g, "")
  //           : "",
  //       userNtfToken: ntfToken || "",
  //       sentBy: notificationProps.sentBy ?? "app",
  //       adminId: notificationProps.adminId,
  //       data: notificationProps.data,
  //     });
  //   }
  // }
};
