import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type RecallBotState =
  | "scheduled"
  | "joining"
  | "in_call"
  | "done"
  | "failed";

export interface IRecallBot extends Document {
  meetingId: Types.ObjectId;
  recallBotId: string;
  state: RecallBotState;
  createdAt: Date;
  updatedAt: Date;
}

const RecallBotSchema = new Schema<IRecallBot>(
  {
    meetingId: {
      type: Schema.Types.ObjectId,
      ref: "Meeting",
      required: true,
      index: true,
    },
    recallBotId: {
      type: String,
      required: true,
      unique: true,
    },
    state: {
      type: String,
      enum: ["scheduled", "joining", "in_call", "done", "failed"],
      default: "scheduled",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const RecallBot: Model<IRecallBot> =
  mongoose.models.RecallBot ||
  mongoose.model<IRecallBot>("RecallBot", RecallBotSchema);
