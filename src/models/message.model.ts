import { Document, PaginateModel, Schema, Types, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  senderType: "user" | "organization";
  content: string;
  isRead: boolean;
  readAt?: Date;
  isDeleted: boolean; // Soft delete flag
  createdAt?: Date;
  updatedAt?: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "conversation",
      required: true,
    },
    senderId: { type: Schema.Types.ObjectId, required: true },
    senderType: {
      type: String,
      enum: ["user", "organization"],
      required: true,
    },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

messageSchema.plugin(mongoosePaginate);

messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ senderId: 1 });

messageSchema.virtual("senderDetails", {
  refPath: "senderType",
  localField: "senderId",
  foreignField: "_id",
  select:
    "username firstName lastName email businessLogoURL profileImage businessName accountType",
  justOne: true,
});

const MessageModel = model<IMessage, PaginateModel<IMessage>>(
  "message",
  messageSchema,
);

export default MessageModel;
