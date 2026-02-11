const STUCK_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
const LOW_CONFIDENCE_THRESHOLD = 0.75;

export type DashboardRangeParam = "24h" | "7d" | "30d";

export function getDateRange(range: DashboardRangeParam): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date(to.getTime());

  switch (range) {
    case "24h":
      from.setHours(from.getHours() - 24);
      break;
    case "7d":
      from.setDate(from.getDate() - 7);
      break;
    case "30d":
      from.setDate(from.getDate() - 30);
      break;
    default:
      from.setHours(from.getHours() - 24);
  }

  return { from, to };
}

export function isStuck(createdAt: Date): boolean {
  return Date.now() - createdAt.getTime() > STUCK_THRESHOLD_MS;
}

export function isLowConfidence(confidence: number | null | undefined): boolean {
  if (confidence == null) return true;
  return confidence < LOW_CONFIDENCE_THRESHOLD;
}

export { LOW_CONFIDENCE_THRESHOLD };
