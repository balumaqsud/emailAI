import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ISession extends Document {
  userId: Types.ObjectId;
  refreshTokenHash: string;
  deviceName?: string;
  ip?: string;
  userAgent?: string;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    refreshTokenHash: {
      type: String,
      required: false,
    },
    deviceName: {
      type: String,
      required: false,
    },
    ip: {
      type: String,
      required: false,
    },
    userAgent: {
      type: String,
      required: false,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revokedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

// TTL index on expiresAt to auto delete expired sessions.
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session: Model<ISession> =
  mongoose.models.Session ||
  mongoose.model<ISession>("Session", SessionSchema);

