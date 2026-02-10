import type { NextApiRequest, NextApiResponse } from "next";
import { assertMethod, handleApiError, sendJson } from "@/src/server/utils/api";
import { parseBody } from "@/src/server/utils/zod";
import { LoginDto } from "@/src/server/dtos";
import { loginUser } from "@/src/server/auth/auth.service";
import { setRefreshCookie } from "@/src/server/auth/cookies";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    assertMethod(req, ["POST"]);

    const dto = await parseBody(req, LoginDto);
    const result = await loginUser(req, dto);

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

