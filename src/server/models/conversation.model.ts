import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type ConversationType = "direct" | "group";

export interface IConversation extends Document {
  type: ConversationType;
  memberIds: Types.ObjectId[];
  /**
   * Sorted memberIds joined by ":" for uniqueness of membership set.
   */
  memberKey: string;
  lastMessageAt?: Date;
  lastMessageId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    type: {
      type: String,
      enum: ["direct", "group"],
      default: "direct",
      required: true,
    },
    memberIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    memberKey: {
      type: String,
      required: true,
      unique: true,
    },
    lastMessageAt: {
      type: Date,
      required: false,
    },
    lastMessageId: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

ConversationSchema.index({ memberKey: 1 }, { unique: true });
ConversationSchema.index({ memberIds: 1 });
ConversationSchema.index({ lastMessageAt: -1 });

export const Conversation: Model<IConversation> =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);

