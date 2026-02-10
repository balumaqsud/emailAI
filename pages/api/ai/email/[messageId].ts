import type { NextApiRequest, NextApiResponse } from "next";
import { dbConnect } from "@/src/server/db";
import { assertMethod, handleApiError, sendJson } from "@/src/server/utils/api";
import { requireAuth } from "@/src/server/middleware/requireAuth";
import { EmailExtraction } from "@/src/server/models/emailExtraction.model";
import { Types } from "mongoose";
import { badRequest } from "@/src/server/utils/httpErrors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    assertMethod(req, ["GET"]);
    await dbConnect();

    const { userId } = requireAuth(req);

    const messageIdParam = req.query.messageId;
    const messageId = Array.isArray(messageIdParam)
      ? messageIdParam[0]
      : messageIdParam;

    if (!messageId) {
      throw badRequest("Message id is required.");
    }

    const userObjectId = new Types.ObjectId(userId);
    const messageObjectId = new Types.ObjectId(messageId);

    const extraction = await EmailExtraction.findOne({
      userId: userObjectId,
      messageId: messageObjectId,
    })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    if (!extraction) {
      sendJson(res, 200, {
        ok: true,
        data: null,
      });
      return;
    }

    sendJson(res, 200, {
      ok: true,
      data: {
        type: extraction.type,
        extractedData: extraction.extractedData ?? null,
        confidence: extraction.confidence ?? 0,
      },
    });
  } catch (error) {
    handleApiError(res, error);
  }
}

