import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type EmailClassificationType =
  | "invoice"
  | "meeting"
  | "support"
  | "job_application"
  | "general";

export interface IEmailClassification extends Document {
  userId: Types.ObjectId;
  messageId: Types.ObjectId;
  type: EmailClassificationType;
  confidence: number;
  model: string;
  promptVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmailClassificationSchema = new Schema<IEmailClassification>(
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
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    model: {
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

EmailClassificationSchema.index(
  { userId: 1, messageId: 1 },
  { unique: true },
);
EmailClassificationSchema.index({ type: 1 });

export const EmailClassification: Model<IEmailClassification> =
  mongoose.models.EmailClassification ||
  mongoose.model<IEmailClassification>(
    "EmailClassification",
    EmailClassificationSchema,
  );

