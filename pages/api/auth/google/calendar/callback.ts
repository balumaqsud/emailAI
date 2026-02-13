import type { NextApiRequest, NextApiResponse } from "next";
import { assertMethod, handleApiError, sendJson } from "@/src/server/utils/api";
import { dbConnect } from "@/src/server/db";
import { User } from "@/src/server/models";
import { exchangeCodeForGoogleCalendarTokens } from "@/src/server/auth/googleCalendar.auth.service";
import { verifyAccessToken } from "@/src/server/auth/tokens";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    assertMethod(req, ["GET"]);

    const { code } = req.query;

    if (!code || typeof code !== "string") {
      throw new Error("Missing authorization code from Google Calendar.");
    }

    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new Error(
        "Missing Authorization header for Google Calendar connect.",
      );
    }
    const token = header.slice("Bearer ".length).trim();
    const payload = verifyAccessToken(token);

    const tokens = await exchangeCodeForGoogleCalendarTokens(code);

    await dbConnect();

    const user = await User.findById(payload.sub);
    if (!user) {
      throw new Error("Authenticated user not found.");
    }

    user.googleAccessToken = tokens.accessToken;
    user.googleRefreshToken = tokens.refreshToken;
    user.googleTokenExpiresAt = tokens.expiresAt;

    await user.save();

    sendJson(res, 200, {
      ok: true,
    });
  } catch (error) {
    handleApiError(res, error);
  }
}
