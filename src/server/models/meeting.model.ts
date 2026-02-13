import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type MeetingStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "failed";

export interface IMeeting extends Document {
  ownerUserId: Types.ObjectId;
  title: string;
  startAt: Date;
  endAt: Date;
  timezone: string;
  attendeeEmails: string[];
  meetUrl?: string;
  calendarEventId?: string;
  status: MeetingStatus;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema = new Schema<IMeeting>(
  {
    ownerUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    startAt: {
      type: Date,
      required: true,
    },
    endAt: {
      type: Date,
      required: true,
    },
    timezone: {
      type: String,
      required: true,
      default: "UTC",
    },
    attendeeEmails: {
      type: [String],
      default: [],
    },
    meetUrl: {
      type: String,
      required: false,
    },
    calendarEventId: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["scheduled", "in_progress", "completed", "failed"],
      default: "scheduled",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

MeetingSchema.index({ ownerUserId: 1, startAt: -1 });
MeetingSchema.index({ calendarEventId: 1 }, { unique: true, sparse: true });

export const Meeting: Model<IMeeting> =
  mongoose.models.Meeting ||
  mongoose.model<IMeeting>("Meeting", MeetingSchema);
