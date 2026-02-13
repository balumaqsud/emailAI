import type { NextApiRequest, NextApiResponse } from "next";
import { assertMethod, sendJson } from "@/src/server/utils/api";
import { handleRecallWebhook } from "@/src/server/services/webhook.service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    assertMethod(req, ["POST"]);

    const body = req.body;
    if (!body || typeof body !== "object") {
      sendJson(res, 200, { received: true });
      return;
    }

    await handleRecallWebhook(body);

    sendJson(res, 200, { received: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[Recall webhook] error:", error);
    sendJson(res, 200, { received: true });
  }
}
