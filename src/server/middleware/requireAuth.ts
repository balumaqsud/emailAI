import type { NextApiRequest } from "next";
import { verifyAccessToken } from "@/src/server/auth/tokens";
import { HttpError, unauthorized } from "@/src/server/utils/httpErrors";

export type AuthContext = {
  userId: string;
  nickname: string;
};

export function requireAuth(req: NextApiRequest): AuthContext {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw unauthorized("Missing or invalid Authorization header.");
  }

  const token = header.slice("Bearer ".length).trim();

  try {
    const payload = verifyAccessToken(token);
    return {
      userId: payload.sub,
      nickname: payload.nickname,
    };
  } catch (error) {
    const message =
      error instanceof HttpError
        ? error.message
        : "Invalid or expired access token.";
    throw unauthorized(message);
  }
}

