import type { NextApiRequest, NextApiResponse } from "next";
import { assertMethod, handleApiError, sendJson } from "@/src/server/utils/api";
import { requireAuth } from "@/src/server/middleware/requireAuth";
import { listTranscript } from "@/src/server/services/meetings.service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    assertMethod(req, ["GET"]);
    const auth = requireAuth(req);

    const id = req.query.id;
    if (!id || typeof id !== "string") {
      sendJson(res, 200, { ok: true, chunks: [] });
      return;
    }

    const afterSeqParam = req.query.afterSeq;
    const afterSeq =
      afterSeqParam != null
        ? Number.parseInt(String(afterSeqParam), 10)
        : undefined;

    const chunks = await listTranscript(auth.userId, id, afterSeq);

    sendJson(res, 200, {
      ok: true,
      chunks,
    });
  } catch (error) {
    handleApiError(res, error);
  }
}
