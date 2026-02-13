import type { NextApiRequest, NextApiResponse } from "next";
import { assertMethod, handleApiError, sendJson } from "@/src/server/utils/api";
import { dbConnect } from "@/src/server/db";
import { User } from "@/src/server/models";
import {
  exchangeCodeForGmailTokens,
  getGmailProfile,
} from "@/src/server/auth/gmail.service";
import { verifyAccessToken } from "@/src/server/auth/tokens";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    assertMethod(req, ["GET"]);

    const { code } = req.query;

    if (!code || typeof code !== "string") {
      throw new Error("Missing authorization code from Gmail.");
    }

    // The user must also be authenticated in our app so we know which user
    // to attach Gmail credentials to. We use the same Bearer token as other APIs.
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new Error("Missing Authorization header for Gmail connect.");
    }
    const token = header.slice("Bearer ".length).trim();
    const payload = verifyAccessToken(token);

    const tokens = await exchangeCodeForGmailTokens(code);
    const profile = await getGmailProfile(tokens.accessToken);

    await dbConnect();

    const user = await User.findById(payload.sub);
    if (!user) {
      throw new Error("Authenticated user not found.");
    }

    user.gmailEmail = profile.emailAddress.toLowerCase();
    user.gmailAccessToken = tokens.accessToken;
    user.gmailRefreshToken = tokens.refreshToken;
    user.gmailTokenExpiresAt = tokens.expiresAt;
    if (profile.historyId) {
      user.gmailHistoryId = String(profile.historyId);
    }

    await user.save();

    sendJson(res, 200, {
      ok: true,
      gmailEmail: user.gmailEmail,
    });
  } catch (error) {
    handleApiError(res, error);
  }
}

