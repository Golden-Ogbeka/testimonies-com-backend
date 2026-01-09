import { IOrganization } from "../../../models/organization.model";
import { IUser } from "../../../models/user.model";
import { EmailAttachmentType } from "../../../types";
import { NotificationType, PushNotificationType } from "../../../types/data";

import { sendEmail } from "../../../utils/mailer";

// --- Type definitions ---

// Allow both plain objects and Mongoose documents

// Base notification props
type BaseNotifyUserProps = {
  sendInAppNotification?: boolean;
  sendPushNotification?: boolean;
  sendEmailNotification?: boolean;
  userDetails?: IUser | IOrganization;
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
  multipleUsers: IUser[];
} & BaseNotifyUserProps;

// --- Main function ---

export const notifyUser = async (
  props: NotifyUserSingle | NotifyUserMultiple,
): Promise<void> => {
  const {
    sendEmailNotification,
    message,
    sendInAppNotification,
    sendPushNotification,
    title,
    userDetails,
    emailAttachment,
    isMultiple = false,
    multipleUsers = [],
    ...notificationProps
  } = props;

  // --- Extract user info safely ---
  const userId =
    notificationProps?.userId ||
    (userDetails && "_id" in userDetails ? userDetails._id : undefined);

  const username =
    (userDetails &&
      ("firstName" in userDetails
        ? userDetails.firstName
        : userDetails.email)) ||
    "User";

  const ntfToken =
    notificationProps.userNtfToken ||
    (userDetails && "ntfToken" in userDetails ? userDetails.ntfToken : "");

  // --- Email Notifications ---
  if (sendEmailNotification) {
    await sendEmail({
      recipient: userDetails?.email ?? "",
      subject: title,
      email: message,
      username,
      attachmentDetails: emailAttachment,
    });
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
