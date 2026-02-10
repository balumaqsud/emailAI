import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type DeliveryStatus = "sent" | "delivered" | "failed";

export interface IReadByEntry {
  userId: Types.ObjectId;
  readAt: Date;
}

export interface IAttachment {
  filename: string;
  mimeType: string;
  size: number;
  storageKey: string;
}

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  toUserIds: Types.ObjectId[];
  subject?: string;
  body: {
    text: string;
    html?: string;
  };
  snippet: string;
  delivery: DeliveryStatus;
  readBy: IReadByEntry[];
  attachments?: IAttachment[];
  deletedFor?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ReadBySchema = new Schema<IReadByEntry>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    readAt: {
      type: Date,
      required: true,
    },
  },
  { _id: false },
);

const AttachmentSchema = new Schema<IAttachment>(
  {
    filename: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    storageKey: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    toUserIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    subject: {
      type: String,
      maxlength: 200,
      required: false,
    },
    body: {
      text: {
        type: String,
        required: true,
      },
      html: {
        type: String,
        required: false,
      },
    },
    snippet: {
      type: String,
      required: true,
    },
    delivery: {
      type: String,
      enum: ["sent", "delivered", "failed"],
      default: "sent",
      required: true,
    },
    readBy: {
      type: [ReadBySchema],
      default: [],
    },
    attachments: {
      type: [AttachmentSchema],
      required: false,
    },
    deletedFor: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  },
);

MessageSchema.index(
  { conversationId: 1, createdAt: -1 },
  { name: "conversation_createdAt_desc" },
);
MessageSchema.index(
  { senderId: 1, createdAt: -1 },
  { name: "sender_createdAt_desc" },
);

export const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

