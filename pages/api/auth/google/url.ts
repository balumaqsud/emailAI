import type { NextApiRequest, NextApiResponse } from "next";
import { assertMethod, handleApiError, sendJson } from "@/src/server/utils/api";
import { buildGoogleAuthUrl } from "@/src/server/auth/google.service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    assertMethod(req, ["GET"]);

    // Optionally, a state parameter could be generated and persisted here.
    const url = buildGoogleAuthUrl();

    sendJson(res, 200, {
      ok: true,
      url,
    });
  } catch (error) {
    handleApiError(res, error);
  }
}

