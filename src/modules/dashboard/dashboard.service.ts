/**
 * Dashboard module – core overview aggregation.
 * Filters by userId; includes both sent and received (all extractions/classifications for the user).
 */

import { buildDashboardOverview as buildFromServer } from "@/src/server/services/dashboard.service";
import type { DashboardOverviewDTO, DashboardRange } from "./types";

export async function getDashboardOverview(params: {
  userId: string;
  range: DashboardRange;
}): Promise<DashboardOverviewDTO> {
  const result = await buildFromServer({
    userId: params.userId,
    range: params.range,
  });
  return result as DashboardOverviewDTO;
}
