import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type MailFolder = "inbox" | "sent" | "archive" | "trash";

export interface IMailbox extends Document {
  userId: Types.ObjectId;
  messageId: Types.ObjectId;
  folder: MailFolder;
  isRead: boolean;
  flagged: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MailboxSchema = new Schema<IMailbox>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messageId: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      required: true,
    },
    folder: {
      type: String,
      enum: ["inbox", "sent", "archive", "trash"],
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      required: true,
    },
    flagged: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

MailboxSchema.index(
  { userId: 1, folder: 1, createdAt: -1 },
  { name: "user_folder_createdAt_desc" },
);
MailboxSchema.index(
  { userId: 1, messageId: 1 },
  { unique: true, name: "user_message_unique" },
);

export const Mailbox: Model<IMailbox> =
  mongoose.models.Mailbox ||
  mongoose.model<IMailbox>("Mailbox", MailboxSchema);

