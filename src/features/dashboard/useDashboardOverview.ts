import useSWR from "swr";
import { useAuth } from "@/src/lib/auth/context";
import { fetchDashboardOverview } from "./dashboardClient";
import type { DashboardOverviewDTO, DashboardRange } from "./types";

function useDashboardOverview(range: DashboardRange): {
  data: DashboardOverviewDTO | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
} {
  const { accessToken } = useAuth();

  const { data, error, isLoading, mutate } = useSWR<DashboardOverviewDTO>(
    accessToken ? ["dashboard-overview", range, accessToken] : null,
    ([, rangeKey, token]) =>
      fetchDashboardOverview(rangeKey as DashboardRange, token as string),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30_000,
    },
  );

  return {
    data,
    isLoading: isLoading,
    error: error,
    mutate,
  };
}

export { useDashboardOverview };
