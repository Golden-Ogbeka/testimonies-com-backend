import { Document, PaginateModel, Schema, Types, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface IConversation extends Document {
  participants: {
    userId: Types.ObjectId;
    userType: "user" | "organization";
  }[];
  lastMessage?: Types.ObjectId;
  lastMessageAt?: Date;
  unreadCount: Map<string, number>; // Map of user ID string to unread count
  createdAt?: Date;
  updatedAt?: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [
      {
        userId: { type: Schema.Types.ObjectId, required: true },
        userType: {
          type: String,
          enum: ["user", "organization"],
          required: true,
        },
      },
    ],
    lastMessage: { type: Schema.Types.ObjectId, ref: "message" },
    lastMessageAt: { type: Date },
    unreadCount: { type: Map, of: Number, default: new Map() },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

conversationSchema.plugin(mongoosePaginate);

// Index to find conversations between specific participants quickly
conversationSchema.index({ "participants.userId": 1 });
conversationSchema.index({ lastMessageAt: -1 });

const ConversationModel = model<IConversation, PaginateModel<IConversation>>(
  "conversation",
  conversationSchema,
);

export default ConversationModel;
