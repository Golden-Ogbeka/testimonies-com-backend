import { Document, Types } from "mongoose";
import { IOrganization } from "../models/organization.model";
import { IUser } from "../models/user.model";

export interface INotificationSettings {
  "team-notification": boolean;
  "team-request-notification": boolean;
  "general-notification": boolean;
}
export interface RawGoogleOAuthUserDetails {
  resourceName: string;
  etag: string;
  names: {
    metadata: {
      primary: boolean;
      source: {
        type: string;
        id: string;
      };
      sourcePrimary: boolean;
    };
    displayName: string;
    familyName: string;
    givenName: string;
    displayNameLastFirst: string;
    unstructuredName: string;
  }[];
  photos: [
    {
      metadata: {
        primary: boolean;
        source: {
          type: string;
          id: string;
        };
      };
      url: string;
    },
  ];
  emailAddresses: {
    metadata: {
      primary: boolean;
      verified: boolean;
      source: {
        type: string;
        id: string;
      };
      sourcePrimary: boolean;
    };
    value: string;
  }[];
  phoneNumbers: {
    metadata: {
      primary: boolean;
      verified: boolean;
      source: {
        type: string;
        id: string;
      };
    };
    value: string;
    canonicalForm: string;
    type: string;
    formattedType: string;
  }[];
}

export interface GoogleOAuthUserDetails {
  email: string;
  emailIsVerified: boolean;
  fullName: string;
  firstName: string;
  lastName: string;
  picture: string;
  phoneNumber: string;
}

export type NotificationTypeOptions =
  | "team-notification"
  | "team-request-notification"
  | "general-notification";

export interface NotificationType {
  userId: Types.ObjectId;
  title: string;
  message: string;
  teamId?: Types.ObjectId;
  type: NotificationTypeOptions;
  read?: boolean;
  sentBy?: "app" | "admin"; // either admin or app. Default is app
  adminId?: Types.ObjectId;

  // Virtuals
  // adminDetails?: IAdmin;
  userDetails?: IUser | IOrganization;
}

export type INotification = NotificationType &
  Document & {
    _id: Types.ObjectId;
  };

export interface IMessage extends Document {}

export interface IUserChat extends Document {
  _id: Types.ObjectId;
  user1Id: Types.ObjectId;
  user2Id: Types.ObjectId;

  // Virtuals
  user1Details?: IUser;
  user2Details?: IUser;
}

export type ChatMessageStatus = "sent" | "delivered" | "read";

export interface IUserChatMessage extends Document {
  _id: Types.ObjectId;
  message: string;
  chatId: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  status: ChatMessageStatus;

  // Virtuals
  chatDetails: IUserChat;
  senderDetails?: IUser;
  receiverDetails?: IUser;
}

export interface PushNotificationType<
  T extends Record<string, string> = Record<string, string>,
> {
  userId: Types.ObjectId;
  title: string;
  message: string;
  userNtfToken: string;
  teamId?: Types.ObjectId;

  sentBy?: "app" | "admin";
  adminId?: Types.ObjectId;
  data?: T;
  // adminDetails?: IAdmin;
  userDetails?: IUser;
}

export type IPushNotification = PushNotificationType &
  Document & {
    _id: Types.ObjectId;
  };
