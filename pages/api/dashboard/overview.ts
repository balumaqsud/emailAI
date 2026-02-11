import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "@/src/server/middleware/requireAuth";
import { getDashboardOverview } from "@/src/modules/dashboard/dashboard.service";
import type { DashboardRange } from "@/src/modules/dashboard/types";

const VALID_RANGES: DashboardRange[] = ["24h", "7d", "30d"];

function parseRange(value: unknown): DashboardRange {
  if (typeof value === "string" && VALID_RANGES.includes(value as DashboardRange)) {
    return value as DashboardRange;
  }
  return "24h";
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const auth = requireAuth(req);
    const range = parseRange(req.query.range);

    const data = await getDashboardOverview({
      userId: auth.userId,
      range,
    });

    res.status(200).json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Dashboard overview failed";
    res.status(401).json({ error: message });
  }
}
