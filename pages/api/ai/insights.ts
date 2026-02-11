import type { NextApiRequest, NextApiResponse } from "next";
import { Types } from "mongoose";
import { dbConnect } from "@/src/server/db";
import { assertMethod, handleApiError, sendJson } from "@/src/server/utils/api";
import { requireAuth } from "@/src/server/middleware/requireAuth";
import {
  Mailbox,
  EmailClassification,
  EmailExtraction,
} from "@/src/server/models";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    assertMethod(req, ["GET"]);
    await dbConnect();

    const { userId } = requireAuth(req);
    const userObjectId = new Types.ObjectId(userId);

    // Basic mailbox stats
    const [inboxUnreadCount, totalMessages] = await Promise.all([
      Mailbox.countDocuments({
        userId: userObjectId,
        folder: "inbox",
        isRead: false,
      }).exec(),
      Mailbox.countDocuments({
        userId: userObjectId,
      }).exec(),
    ]);

    // Collect all messageIds for this user to scope AI stats
    const mailboxDocs = await Mailbox.find({
      userId: userObjectId,
    })
      .select({ messageId: 1, folder: 1 })
      .lean()
      .exec();

    const messageIds = mailboxDocs.map((mb) => mb.messageId as Types.ObjectId);

    let typeCounts: Record<string, number> = {};
    let importantCount = 0;
    let peggedForReview = 0;

    if (messageIds.length > 0) {
      // Aggregate classifications by type
      const classificationAgg = await EmailClassification.aggregate<{
        _id: string;
        count: number;
      }>([
        {
          $match: {
            userId: userObjectId,
            messageId: { $in: messageIds },
          },
        },
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
          },
        },
      ]);

      typeCounts = classificationAgg.reduce<Record<string, number>>(
        (acc, doc) => {
          acc[doc._id] = doc.count;
          return acc;
        },
        {},
      );

      // Simple heuristic: treat some types as "important"
      const importantTypes = ["support", "invoice", "job_application"];
      importantCount = classificationAgg
        .filter((doc) => importantTypes.includes(doc._id))
        .reduce((sum, doc) => sum + doc.count, 0);

      // Pegged for review: low-confidence or failed extractions
      const extractionAgg = await EmailExtraction.aggregate<{
        _id: null;
        count: number;
      }>([
        {
          $match: {
            userId: userObjectId,
            messageId: { $in: messageIds },
            $or: [
              { status: "failed" },
              { confidence: { $lt: 0.5 } },
            ],
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
      ]);

      peggedForReview = extractionAgg[0]?.count ?? 0;
    }

    sendJson(res, 200, {
      ok: true,
      data: {
        totals: {
          totalMessages,
          unreadCount: inboxUnreadCount,
          importantCount,
        },
        donut: {
          invoice: typeCounts.invoice ?? 0,
          meeting: typeCounts.meeting ?? 0,
          support: typeCounts.support ?? 0,
          job_application: typeCounts.job_application ?? 0,
          general: typeCounts.general ?? 0,
        },
        peggedForReview,
      },
    });
  } catch (error) {
    handleApiError(res, error);
  }
}

