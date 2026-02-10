import jwt, { JwtPayload } from "jsonwebtoken";

type TokenType = "access" | "refresh";

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
  nickname: string;
  type: "access";
}

export interface RefreshTokenPayload extends JwtPayload {
  sub: string;
  sid: string;
  type: "refresh";
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getAccessTtlMinutes(): number {
  const raw = process.env.JWT_ACCESS_TTL_MIN ?? "15";
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error("JWT_ACCESS_TTL_MIN must be a positive integer.");
  }
  return parsed;
}

function getRefreshTtlDays(): number {
  const raw = process.env.JWT_REFRESH_TTL_DAYS ?? "30";
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error("JWT_REFRESH_TTL_DAYS must be a positive integer.");
  }
  return parsed;
}

export function createAccessToken(payload: {
  userId: string;
  nickname: string;
}): { token: string; expiresAt: Date } {
  const accessSecret = getRequiredEnv("JWT_ACCESS_SECRET");
  const ttlMinutes = getAccessTtlMinutes();

  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  const token = jwt.sign(
    {
      sub: payload.userId,
      nickname: payload.nickname,
      type: "access" as TokenType,
    },
    accessSecret,
    { expiresIn: `${ttlMinutes}m` },
  );

  return { token, expiresAt };
}

export function createRefreshToken(payload: {
  userId: string;
  sessionId: string;
}): { token: string; expiresAt: Date } {
  const refreshSecret = getRequiredEnv("JWT_REFRESH_SECRET");
  const ttlDays = getRefreshTtlDays();

  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

  const token = jwt.sign(
    {
      sub: payload.userId,
      sid: payload.sessionId,
      type: "refresh" as TokenType,
    },
    refreshSecret,
    { expiresIn: `${ttlDays}d` },
  );

  return { token, expiresAt };
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const accessSecret = getRequiredEnv("JWT_ACCESS_SECRET");
  const decoded = jwt.verify(token, accessSecret) as AccessTokenPayload;
  if (decoded.type !== "access") {
    throw new Error("Invalid token type for access token.");
  }
  return decoded;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const refreshSecret = getRequiredEnv("JWT_REFRESH_SECRET");
  const decoded = jwt.verify(token, refreshSecret) as RefreshTokenPayload;
  if (decoded.type !== "refresh") {
    throw new Error("Invalid token type for refresh token.");
  }
  return decoded;
}

