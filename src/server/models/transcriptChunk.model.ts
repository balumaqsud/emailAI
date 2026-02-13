import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ITranscriptChunk extends Document {
  meetingId: Types.ObjectId;
  recallBotId: string;
  seq: number;
  chunkKey: string;
  speakerName?: string;
  speakerId?: string;
  text: string;
  startMs?: number;
  endMs?: number;
  receivedAt: Date;
}

const TranscriptChunkSchema = new Schema<ITranscriptChunk>(
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
      index: true,
    },
    seq: {
      type: Number,
      required: true,
    },
    chunkKey: {
      type: String,
      required: true,
    },
    speakerName: {
      type: String,
      required: false,
    },
    speakerId: {
      type: String,
      required: false,
    },
    text: {
      type: String,
      required: true,
    },
    startMs: {
      type: Number,
      required: false,
    },
    endMs: {
      type: Number,
      required: false,
    },
    receivedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: false,
  },
);

TranscriptChunkSchema.index({ meetingId: 1, seq: 1 });
TranscriptChunkSchema.index({ chunkKey: 1 }, { unique: true, sparse: true });

export const TranscriptChunk: Model<ITranscriptChunk> =
  mongoose.models.TranscriptChunk ||
  mongoose.model<ITranscriptChunk>("TranscriptChunk", TranscriptChunkSchema);
