import type { NextApiRequest, NextApiResponse } from "next";
import { dbConnect } from "@/src/server/db";
import { assertMethod, handleApiError, sendJson } from "@/src/server/utils/api";
import { requireAuth } from "@/src/server/middleware/requireAuth";
import {
  deleteForUser,
  getMessageForUser,
} from "@/src/server/services/mail.service";
import { badRequest } from "@/src/server/utils/httpErrors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    assertMethod(req, ["GET", "DELETE"]);
    await dbConnect();

    const { userId } = requireAuth(req);

    const messageIdParam = req.query.messageId;
    const messageId = Array.isArray(messageIdParam)
      ? messageIdParam[0]
      : messageIdParam;

    if (!messageId) {
      throw badRequest("Message id is required.");
    }

    if (req.method === "GET") {
      const data = await getMessageForUser({ userId, messageId });
      sendJson(res, 200, {
        ok: true,
        data,
      });
      return;
    }

    if (req.method === "DELETE") {
      await deleteForUser({ userId, messageId });
      sendJson(res, 200, {
        ok: true,
        data: { deleted: true },
      });
      return;
    }
  } catch (error) {
    handleApiError(res, error);
  }
}

