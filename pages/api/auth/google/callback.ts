import type { NextApiRequest, NextApiResponse } from "next";
import { assertMethod, handleApiError, sendJson } from "@/src/server/utils/api";
import { getGoogleProfileFromCode } from "@/src/server/auth/google.service";
import { loginOrRegisterWithGoogle } from "@/src/server/auth/auth.service";
import { setRefreshCookie } from "@/src/server/auth/cookies";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    assertMethod(req, ["GET"]);

    const { code } = req.query;

    if (!code || typeof code !== "string") {
      throw new Error("Missing authorization code from Google.");
    }

    const profile = await getGoogleProfileFromCode(code);
    const result = await loginOrRegisterWithGoogle(req, profile);

    setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);

    sendJson(res, 200, {
      ok: true,
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    handleApiError(res, error);
  }
}

