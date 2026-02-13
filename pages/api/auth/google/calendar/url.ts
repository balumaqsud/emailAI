import type { NextApiRequest, NextApiResponse } from "next";
import { assertMethod, handleApiError, sendJson } from "@/src/server/utils/api";
import { requireAuth } from "@/src/server/middleware/requireAuth";
import { buildGoogleCalendarAuthUrl } from "@/src/server/auth/googleCalendar.auth.service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    assertMethod(req, ["GET"]);

    const ctx = requireAuth(req);
    const url = buildGoogleCalendarAuthUrl(ctx.userId);

    sendJson(res, 200, {
      ok: true,
      url,
    });
  } catch (error) {
    handleApiError(res, error);
  }
}
