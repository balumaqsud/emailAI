import type { NextApiRequest, NextApiResponse } from "next";
import { assertMethod, handleApiError, sendJson } from "@/src/server/utils/api";
import { requireAuth } from "@/src/server/middleware/requireAuth";
import {
  scheduleMeeting,
  listMeetings,
} from "@/src/server/services/meetings.service";
import { badRequest } from "@/src/server/utils/httpErrors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    assertMethod(req, ["GET", "POST"]);
    const auth = requireAuth(req);

    if (req.method === "GET") {
      const limitParam = req.query.limit;
      const limitRaw = Array.isArray(limitParam)
        ? limitParam[0]
        : limitParam ?? "50";
      const limit = Number.parseInt(String(limitRaw), 10);

      const cursorParam = req.query.cursor;
      const cursor = Array.isArray(cursorParam)
        ? cursorParam[0]
        : (cursorParam as string | undefined);

      const data = await listMeetings(auth.userId, {
        limit: Number.isFinite(limit) && limit > 0 ? limit : 50,
        cursor: cursor ?? undefined,
      });

      sendJson(res, 200, {
        ok: true,
        data,
      });
      return;
    }

    if (req.method === "POST") {
      const body = req.body;
      if (!body || typeof body !== "object") {
        throw badRequest("Request body must be a JSON object.");
      }

      const { title, meetUrl, startAt, endAt, timezone, attendeeEmails } = body;

      if (!title || typeof title !== "string" || !title.trim()) {
        throw badRequest("title is required.");
      }
      if (!meetUrl || typeof meetUrl !== "string" || !meetUrl.trim()) {
        throw badRequest("meetUrl is required.");
      }
      if (!startAt) {
        throw badRequest("startAt is required.");
      }
      if (!endAt) {
        throw badRequest("endAt is required.");
      }

      const meeting = await scheduleMeeting(auth.userId, {
        title: title.trim(),
        meetUrl: meetUrl.trim(),
        startAt,
        endAt,
        timezone: typeof timezone === "string" ? timezone : "UTC",
        attendeeEmails: Array.isArray(attendeeEmails)
          ? attendeeEmails.filter((e: unknown) => typeof e === "string")
          : [],
      });

      sendJson(res, 201, {
        ok: true,
        meeting,
      });
    }
  } catch (error) {
    handleApiError(res, error);
  }
}
