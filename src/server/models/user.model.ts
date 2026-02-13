import mongoose, { Schema, Document, Model } from "mongoose";

export type UserStatus = "active" | "blocked";

export interface IUser extends Document {
  nickname: string;
  email?: string;
  passwordHash?: string;
  status: UserStatus;
  lastLoginAt?: Date;
  provider?: string;
  providerId?: string;
  name?: string;
  pictureUrl?: string;
  gmailEmail?: string;
  gmailAccessToken?: string;
  gmailRefreshToken?: string;
  gmailTokenExpiresAt?: Date;
  gmailHistoryId?: string;
  googleAccessToken?: string;
  googleRefreshToken?: string;
  googleTokenExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    nickname: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
      required: true,
    },
    lastLoginAt: {
      type: Date,
      required: false,
    },
    provider: {
      type: String,
      required: false,
      index: true,
    },
    providerId: {
      type: String,
      required: false,
      index: true,
    },
    name: {
      type: String,
      required: false,
      trim: true,
    },
    pictureUrl: {
      type: String,
      required: false,
    },
    gmailEmail: {
      type: String,
      required: false,
      lowercase: true,
      trim: true,
    },
    gmailAccessToken: {
      type: String,
      required: false,
    },
    gmailRefreshToken: {
      type: String,
      required: false,
    },
    gmailTokenExpiresAt: {
      type: Date,
      required: false,
    },
    gmailHistoryId: {
      type: String,
      required: false,
    },
    googleAccessToken: {
      type: String,
      required: false,
    },
    googleRefreshToken: {
      type: String,
      required: false,
    },
    googleTokenExpiresAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

UserSchema.index({ nickname: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true, sparse: true });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

