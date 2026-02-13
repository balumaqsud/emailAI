import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type ActionItem = {
  text: string;
  owner?: string;
  dueAt?: Date;
};

export interface IMeetingArtifact extends Document {
  meetingId: Types.ObjectId;
  finalTranscript: string;
  summary?: string;
  actionItems: ActionItem[];
  topics: string[];
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ActionItemSchema = new Schema<ActionItem>(
  {
    text: { type: String, required: true },
    owner: { type: String, required: false },
    dueAt: { type: Date, required: false },
  },
  { _id: false },
);

const MeetingArtifactSchema = new Schema<IMeetingArtifact>(
  {
    meetingId: {
      type: Schema.Types.ObjectId,
      ref: "Meeting",
      required: true,
      unique: true,
    },
    finalTranscript: {
      type: String,
      required: true,
      default: "",
    },
    summary: {
      type: String,
      required: false,
    },
    actionItems: {
      type: [ActionItemSchema],
      default: [],
    },
    topics: {
      type: [String],
      default: [],
    },
    completedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

export const MeetingArtifact: Model<IMeetingArtifact> =
  mongoose.models.MeetingArtifact ||
  mongoose.model<IMeetingArtifact>(
    "MeetingArtifact",
    MeetingArtifactSchema,
  );
