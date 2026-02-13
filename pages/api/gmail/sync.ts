import type { NextApiRequest, NextApiResponse } from "next";
import { assertMethod, handleApiError, sendJson } from "@/src/server/utils/api";
import { requireAuth } from "@/src/server/middleware/requireAuth";
import { syncGmailForUser } from "@/src/server/services/gmailSync.service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    assertMethod(req, ["POST"]);

    const { userId } = requireAuth(req);
    const result = await syncGmailForUser(userId);

    sendJson(res, 200, {
      ok: true,
      importedCount: result.importedCount,
      updatedCount: result.updatedCount,
    });
  } catch (error) {
    handleApiError(res, error);
  }
}

