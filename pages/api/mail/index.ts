import type { NextApiRequest, NextApiResponse } from "next";
import { dbConnect } from "@/src/server/db";
import { assertMethod, handleApiError, sendJson } from "@/src/server/utils/api";
import { requireAuth } from "@/src/server/middleware/requireAuth";
import { MAIL_FOLDERS } from "@/src/lib/constants/folders";
import { listMail } from "@/src/server/services/mail.service";
import { badRequest } from "@/src/server/utils/httpErrors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    assertMethod(req, ["GET"]);
    await dbConnect();

    const { userId } = requireAuth(req);

    const folderParam = req.query.folder;
    const folder = Array.isArray(folderParam)
      ? folderParam[0]
      : folderParam || "inbox";

    if (!MAIL_FOLDERS.includes(folder as (typeof MAIL_FOLDERS)[number])) {
      throw badRequest("Invalid folder.");
    }

    const limitParam = req.query.limit;
    const limitRaw = Array.isArray(limitParam)
      ? limitParam[0]
      : limitParam ?? "20";
    const limit = Number.parseInt(String(limitRaw), 10);

    const cursorParam = req.query.cursor;
    const cursor = Array.isArray(cursorParam) ? cursorParam[0] : cursorParam;

    const data = await listMail({
      userId,
      folder: folder as (typeof MAIL_FOLDERS)[number],
      limit: Number.isFinite(limit) && limit > 0 ? limit : 20,
      cursor: cursor ?? null,
    });

    sendJson(res, 200, {
      ok: true,
      data,
    });
  } catch (error) {
    handleApiError(res, error);
  }
}

