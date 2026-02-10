import type { NextApiRequest, NextApiResponse } from "next";
import { dbConnect } from "@/src/server/db";
import { assertMethod, handleApiError, sendJson } from "@/src/server/utils/api";
import { requireAuth } from "@/src/server/middleware/requireAuth";
import { MarkReadDto } from "@/src/server/dtos/message.dto";
import { setReadStatus } from "@/src/server/services/mail.service";
import { badRequest, fromZodError } from "@/src/server/utils/httpErrors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    assertMethod(req, ["PATCH"]);
    await dbConnect();

    const { userId } = requireAuth(req);

    const messageIdParam = req.query.messageId;
    const messageId = Array.isArray(messageIdParam)
      ? messageIdParam[0]
      : messageIdParam;

    if (!messageId) {
      throw badRequest("Message id is required.");
    }

    const parseResult = MarkReadDto.safeParse(req.body);
    if (!parseResult.success) {
      throw fromZodError(parseResult.error);
    }

    await setReadStatus({
      userId,
      messageId,
      isRead: parseResult.data.isRead,
    });

    sendJson(res, 200, {
      ok: true,
      data: { updated: true },
    });
  } catch (error) {
    handleApiError(res, error);
  }
}

