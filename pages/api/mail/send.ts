import type { NextApiRequest, NextApiResponse } from "next";
import { dbConnect } from "@/src/server/db";
import { assertMethod, handleApiError, sendJson } from "@/src/server/utils/api";
import { parseBody } from "@/src/server/utils/zod";
import { SendMessageDto } from "@/src/server/dtos/message.dto";
import { requireAuth } from "@/src/server/middleware/requireAuth";
import { sendMail } from "@/src/server/services/mail.service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    assertMethod(req, ["POST"]);
    await dbConnect();

    const { userId } = requireAuth(req);
    const dto = await parseBody(req, SendMessageDto);

    const result = await sendMail({ senderId: userId, payload: dto });

    sendJson(res, 201, {
      ok: true,
      data: result,
    });
  } catch (error) {
    handleApiError(res, error);
  }
}

