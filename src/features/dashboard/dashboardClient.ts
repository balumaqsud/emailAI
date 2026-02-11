import { dashboardOverviewSchema } from "./schemas";
import type { DashboardOverviewDTO, DashboardRange } from "./types";

function getBaseUrl(): string {
  if (typeof window !== "undefined") return "";
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function fetchDashboardOverview(
  range: DashboardRange,
  accessToken: string,
): Promise<DashboardOverviewDTO> {
  const url = `${getBaseUrl()}/api/dashboard/overview?range=${encodeURIComponent(range)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    let message = `Dashboard overview failed: ${res.status}`;
    try {
      const json = JSON.parse(body) as { error?: string };
      if (json?.error) message = json.error;
    } catch {
      if (body) message = body.slice(0, 200);
    }
    throw new Error(message);
  }

  const raw = await res.json();
  const parsed = dashboardOverviewSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Invalid dashboard overview response");
  }
  return parsed.data as DashboardOverviewDTO;
}
