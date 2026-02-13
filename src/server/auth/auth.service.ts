import type { NextApiRequest } from "next";
import { Types } from "mongoose";
import { dbConnect } from "@/src/server/db";
import { User, Session } from "@/src/server/models";
import {
  RegisterDto,
  LoginDto,
  type RegisterDtoInput,
  type LoginDtoInput,
} from "@/src/server/dtos";
import { hashPassword, verifyPassword } from "./password";
import {
  createAccessToken,
  createRefreshToken,
  type AccessTokenPayload,
} from "./tokens";
import { ApiError } from "@/src/server/utils/api";
import { type GoogleProfile } from "./google.service";

type PublicUser = {
  id: string;
  nickname: string;
  email?: string;
};

function toPublicUser(user: {
  _id: Types.ObjectId;
  nickname: string;
  email?: string;
}): PublicUser {
  return {
    id: user._id.toHexString(),
    nickname: user.nickname,
    email: user.email,
  };
}

function getClientIp(req: NextApiRequest): string | undefined {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.length > 0) {
    return xff.split(",")[0]?.trim();
  }
  if (Array.isArray(xff) && xff.length > 0) {
    return xff[0];
  }
  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string" && realIp.length > 0) {
    return realIp;
  }
  return req.socket.remoteAddress ?? undefined;
}

export async function registerUser(
  req: NextApiRequest,
  data: RegisterDtoInput,
): Promise<{
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
  accessPayload: AccessTokenPayload;
  refreshExpiresAt: Date;
}> {
  await dbConnect();

  const { nickname, password, email } = RegisterDto.parse(data);

  // Ensure nickname uniqueness
  const existingByNickname = await User.findOne({
    nickname: nickname.toLowerCase(),
  }).lean();
  if (existingByNickname) {
    throw new ApiError({
      status: 409,
      code: "NICKNAME_TAKEN",
      message: "Nickname is already in use.",
    });
  }

  if (email) {
    const existingByEmail = await User.findOne({
      email: email.toLowerCase(),
    }).lean();
    if (existingByEmail) {
      throw new ApiError({
        status: 409,
        code: "EMAIL_TAKEN",
        message: "Email is already in use.",
      });
    }
  }

  const passwordHash = await hashPassword(password);

  const createdUser = await User.create({
    nickname,
    email,
    passwordHash,
  });

  const publicUser = toPublicUser(createdUser);

  // Create session + tokens
  const ip = getClientIp(req);
  const userAgent =
    typeof req.headers["user-agent"] === "string"
      ? req.headers["user-agent"]
      : undefined;

  const access = createAccessToken({
    userId: publicUser.id,
    nickname: publicUser.nickname,
  });

  const session = await Session.create({
    userId: createdUser._id,
    refreshTokenHash: "", // placeholder, updated below
    ip,
    userAgent,
    expiresAt: new Date(),
  });

  const refresh = createRefreshToken({
    userId: publicUser.id,
    sessionId: session._id.toHexString(),
  });

  // Hash and persist refresh token
  const hashedRefresh = await hashPassword(refresh.token);
  session.refreshTokenHash = hashedRefresh;
  session.expiresAt = refresh.expiresAt;
  await session.save();

  return {
    user: publicUser,
    accessToken: access.token,
    refreshToken: refresh.token,
    accessPayload: {
      sub: publicUser.id,
      nickname: publicUser.nickname,
      type: "access",
    },
    refreshExpiresAt: refresh.expiresAt,
  };
}

export async function loginUser(
  req: NextApiRequest,
  data: LoginDtoInput,
): Promise<{
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
}> {
  await dbConnect();

  const { identifier, password } = LoginDto.parse(data);

  const lowered = identifier.toLowerCase();

  const user =
    (await User.findOne({ nickname: lowered })) ??
    (await User.findOne({ email: lowered }));

  if (!user) {
    throw new ApiError({
      status: 401,
      code: "INVALID_CREDENTIALS",
      message: "Invalid credentials.",
    });
  }

  if (!user.passwordHash) {
    throw new ApiError({
      status: 401,
      code: "INVALID_CREDENTIALS",
      message: "Invalid credentials.",
    });
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);
  if (!isValidPassword) {
    throw new ApiError({
      status: 401,
      code: "INVALID_CREDENTIALS",
      message: "Invalid credentials.",
    });
  }

  const publicUser = toPublicUser(user);

  const ip = getClientIp(req);
  const userAgent =
    typeof req.headers["user-agent"] === "string"
      ? req.headers["user-agent"]
      : undefined;

  const access = createAccessToken({
    userId: publicUser.id,
    nickname: publicUser.nickname,
  });

  const session = await Session.create({
    userId: user._id,
    refreshTokenHash: "",
    ip,
    userAgent,
    expiresAt: new Date(),
  });

  const refresh = createRefreshToken({
    userId: publicUser.id,
    sessionId: session._id.toHexString(),
  });

  const hashedRefresh = await hashPassword(refresh.token);
  session.refreshTokenHash = hashedRefresh;
  session.expiresAt = refresh.expiresAt;
  await session.save();

  return {
    user: publicUser,
    accessToken: access.token,
    refreshToken: refresh.token,
    refreshExpiresAt: refresh.expiresAt,
  };
}

export async function loginOrRegisterWithGoogle(
  req: NextApiRequest,
  profile: GoogleProfile,
): Promise<{
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
}> {
  await dbConnect();

  const email = profile.email?.toLowerCase();

  let user =
    (await User.findOne({
      provider: "google",
      providerId: profile.id,
    })) ?? (email ? await User.findOne({ email }) : null);

  if (!user) {
    // Derive a nickname from email or name, ensuring uniqueness.
    let baseNickname =
      (email?.split("@")[0] ??
        profile.name?.toLowerCase().replace(/\s+/g, "") ??
        "user") || "user";

    baseNickname = baseNickname.toLowerCase();

    let nickname = baseNickname;
    let suffix = 1;
    // Ensure nickname uniqueness
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existing = await User.findOne({
        nickname: nickname,
      }).lean();
      if (!existing) break;
      nickname = `${baseNickname}${suffix}`;
      suffix += 1;
    }

    user = await User.create({
      nickname,
      email,
      provider: "google",
      providerId: profile.id,
      name: profile.name,
      pictureUrl: profile.picture,
      status: "active",
      // passwordHash intentionally omitted for Google-only users
    });
  } else {
    // Link existing user to Google if not already linked and update profile info.
    if (!user.provider || !user.providerId) {
      user.provider = "google";
      user.providerId = profile.id;
    }
    if (profile.name && !user.name) {
      user.name = profile.name;
    }
    if (profile.picture && !user.pictureUrl) {
      user.pictureUrl = profile.picture;
    }
    user.lastLoginAt = new Date();
    await user.save();
  }

  const publicUser = toPublicUser(user);

  const ip = getClientIp(req);
  const userAgent =
    typeof req.headers["user-agent"] === "string"
      ? req.headers["user-agent"]
      : undefined;

  const access = createAccessToken({
    userId: publicUser.id,
    nickname: publicUser.nickname,
  });

  const session = await Session.create({
    userId: user._id,
    refreshTokenHash: "",
    ip,
    userAgent,
    expiresAt: new Date(),
  });

  const refresh = createRefreshToken({
    userId: publicUser.id,
    sessionId: session._id.toHexString(),
  });

  const hashedRefresh = await hashPassword(refresh.token);
  session.refreshTokenHash = hashedRefresh;
  session.expiresAt = refresh.expiresAt;
  await session.save();

  return {
    user: publicUser,
    accessToken: access.token,
    refreshToken: refresh.token,
    refreshExpiresAt: refresh.expiresAt,
  };
}

