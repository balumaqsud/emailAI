import type { NextApiRequest, NextApiResponse } from "next";
import { Types } from "mongoose";
import { dbConnect } from "@/src/server/db";
import {
  assertMethod,
  handleApiError,
  sendJson,
} from "@/src/server/utils/api";
import { requireAuth } from "@/src/server/middleware/requireAuth";
import { badRequest, notFound } from "@/src/server/utils/httpErrors";
import {
  EmailClassification,
  EmailExtraction,
  Mailbox,
  Message,
} from "@/src/server/models";

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

    // Ensure the user has access to this message via their mailbox
    const mailbox = await Mailbox.findOne({
      userId: userObjectId,
      messageId: messageObjectId,
    })
      .select({ _id: 1 })
      .lean()
      .exec();

    if (!mailbox) {
      throw notFound("Message not found for this user.");
    }

    const [classification, extraction, message] = await Promise.all([
      EmailClassification.findOne({
        userId: userObjectId,
        messageId: messageObjectId,
      })
        .sort({ createdAt: -1 })
        .lean()
        .exec(),
      EmailExtraction.findOne({
        userId: userObjectId,
        messageId: messageObjectId,
      })
        .sort({ createdAt: -1 })
        .lean()
        .exec(),
      Message.findById(messageObjectId)
        .select({
          subject: 1,
          senderId: 1,
          createdAt: 1,
        })
        .lean()
        .exec(),
    ]);

    sendJson(res, 200, {
      ok: true,
      data: {
        message: message
          ? {
              id: messageObjectId.toHexString(),
              subject: message.subject ?? null,
              senderId: (message.senderId as Types.ObjectId).toHexString(),
              createdAt: message.createdAt,
            }
          : null,
        classification: classification
          ? {
              type: classification.type,
              confidence: classification.confidence,
              modelName: classification.modelName,
              promptVersion: classification.promptVersion,
              createdAt: classification.createdAt,
              updatedAt: classification.updatedAt,
            }
          : null,
        extraction: extraction
          ? {
              status: extraction.status,
              type: extraction.type,
              schemaVersion: extraction.schemaVersion,
              confidence: extraction.confidence ?? null,
              missingFields: extraction.missingFields,
              warnings: extraction.warnings,
              modelName: extraction.modelName,
              promptVersion: extraction.promptVersion,
              createdAt: extraction.createdAt,
              updatedAt: extraction.updatedAt,
              extractedData: extraction.extractedData ?? null,
            }
          : null,
      },
    });
  } catch (error) {
    handleApiError(res, error);
  }
}

