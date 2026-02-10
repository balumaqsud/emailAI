import type { NextApiRequest, NextApiResponse } from "next";
import { dbConnect } from "@/src/server/db";
import { assertMethod, handleApiError, sendJson } from "@/src/server/utils/api";
import { requireAuth } from "@/src/server/middleware/requireAuth";
import {
  MoveMessageDto,
  type MoveMessageDtoInput,
} from "@/src/server/dtos/mailbox.dto";
import { moveMessage } from "@/src/server/services/mail.service";
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

    const mergedBody: MoveMessageDtoInput = {
      messageId,
      folder: (req.body?.folder ?? "") as MoveMessageDtoInput["folder"],
    };

    const parsed = MoveMessageDto.safeParse(mergedBody);
    if (!parsed.success) {
      throw fromZodError(parsed.error);
    }

    await moveMessage({
      userId,
      messageId,
      folder: parsed.data.folder,
    });

    sendJson(res, 200, {
      ok: true,
      data: { moved: true },
    });
  } catch (error) {
    handleApiError(res, error);
  }
}

