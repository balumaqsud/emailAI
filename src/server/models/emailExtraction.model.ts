import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type EmailExtractionType =
  | "invoice"
  | "meeting"
  | "support"
  | "job_application"
  | "general";

export type EmailExtractionStatus =
  | "processing"
  | "done"
  | "failed";

export interface IEmailExtraction extends Document {
  userId: Types.ObjectId;
  messageId: Types.ObjectId;
  type: EmailExtractionType;
  schemaVersion: string;
  status: EmailExtractionStatus;
  extractedData: Record<string, unknown> | null;
  confidence?: number;
  missingFields: string[];
  warnings: string[];
  modelName: string;
  promptVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmailExtractionSchema = new Schema<IEmailExtraction>(
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
    type: {
      type: String,
      enum: ["invoice", "meeting", "support", "job_application", "general"],
      required: true,
    },
    schemaVersion: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["processing", "done", "failed"],
      default: "processing",
      required: true,
    },
    extractedData: {
      type: Schema.Types.Mixed,
      default: null,
    },
    confidence: {
      type: Number,
      required: false,
    },
    missingFields: {
      type: [String],
      default: [],
    },
    warnings: {
      type: [String],
      default: [],
    },
    modelName: {
      type: String,
      required: true,
      trim: true,
    },
    promptVersion: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

EmailExtractionSchema.index(
  { userId: 1, messageId: 1, type: 1, schemaVersion: 1 },
  { unique: true },
);
EmailExtractionSchema.index({ messageId: 1 });
EmailExtractionSchema.index({ type: 1 });

export const EmailExtraction: Model<IEmailExtraction> =
  mongoose.models.EmailExtraction ||
  mongoose.model<IEmailExtraction>("EmailExtraction", EmailExtractionSchema);

