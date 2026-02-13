import type { NextApiRequest, NextApiResponse } from "next";
import { assertMethod, handleApiError, sendJson } from "@/src/server/utils/api";
import { requireAuth } from "@/src/server/middleware/requireAuth";
import { buildGmailAuthUrl } from "@/src/server/auth/gmail.service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    assertMethod(req, ["GET"]);

    // Ensure the user is authenticated; we don't use the result directly yet,
    // but this guarantees only logged-in users can start the connect flow.
    const ctx = requireAuth(req);

    const state = ctx.userId;
    const url = buildGmailAuthUrl(state);

    sendJson(res, 200, {
      ok: true,
      url,
    });
  } catch (error) {
    handleApiError(res, error);
  }
}

