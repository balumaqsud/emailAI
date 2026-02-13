import useSWR from "swr";
import { useAuth } from "@/src/lib/auth/context";
import { fetchMeetings } from "./meetingsClient";
import type { MeetingsListResponse } from "./types";

function useMeetings(opts?: { limit?: number; cursor?: string }): {
  data: MeetingsListResponse | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
} {
  const { accessToken } = useAuth();

  const { data, error, isLoading, mutate } = useSWR<MeetingsListResponse>(
    accessToken ? ["meetings", opts?.limit, opts?.cursor, accessToken] : null,
    ([, limit, cursor, token]) =>
      fetchMeetings(token as string, {
        limit: limit as number | undefined,
        cursor: cursor as string | undefined,
      }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5_000,
    },
  );

  return {
    data,
    isLoading,
    error,
    mutate,
  };
}

export { useMeetings };
