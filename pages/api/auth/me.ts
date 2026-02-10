import type { NextApiRequest, NextApiResponse } from "next";
import { assertMethod, handleApiError, sendJson, ApiError } from "@/src/server/utils/api";
import { dbConnect } from "@/src/server/db";
import { User } from "@/src/server/models";
import { verifyAccessToken } from "@/src/server/auth/tokens";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    assertMethod(req, ["GET"]);

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError({
        status: 401,
        code: "UNAUTHORIZED",
        message: "Missing or invalid Authorization header.",
      });
    }

    const token = authHeader.slice("Bearer ".length).trim();

    const payload = verifyAccessToken(token);

    await dbConnect();

    const user = await User.findById(payload.sub).lean();
    if (!user) {
      throw new ApiError({
        status: 401,
        code: "UNAUTHORIZED",
        message: "User not found.",
      });
    }

    sendJson(res, 200, {
      ok: true,
      user: {
        id: user._id.toString(),
        nickname: user.nickname,
        email: user.email,
      },
    });
  } catch (error) {
    handleApiError(res, error);
  }
}

