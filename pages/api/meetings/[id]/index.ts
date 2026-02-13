import type { NextApiRequest, NextApiResponse } from "next";
import { assertMethod, handleApiError, sendJson } from "@/src/server/utils/api";
import { requireAuth } from "@/src/server/middleware/requireAuth";
import { getMeeting } from "@/src/server/services/meetings.service";
import { notFound } from "@/src/server/utils/httpErrors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    assertMethod(req, ["GET"]);
    const auth = requireAuth(req);

    const id = req.query.id;
    if (!id || typeof id !== "string") {
      throw notFound("Meeting not found.");
    }

    const meeting = await getMeeting(auth.userId, id);
    if (!meeting) {
      throw notFound("Meeting not found.");
    }

    sendJson(res, 200, {
      ok: true,
      meeting,
    });
  } catch (error) {
    handleApiError(res, error);
  }
}
