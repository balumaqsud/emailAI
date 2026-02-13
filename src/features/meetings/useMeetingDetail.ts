import useSWR from "swr";
import { useAuth } from "@/src/lib/auth/context";
import { fetchMeetingDetail } from "./meetingsClient";
import type { MeetingDetail } from "./types";

function useMeetingDetail(meetingId: string | null): {
  data: MeetingDetail | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
} {
  const { accessToken } = useAuth();

  const { data, error, isLoading, mutate } = useSWR<MeetingDetail>(
    accessToken && meetingId
      ? ["meeting-detail", meetingId, accessToken]
      : null,
    ([, id, token]) => fetchMeetingDetail(token as string, id as string),
    {
      revalidateOnFocus: false,
      dedupingInterval: 3_000,
    },
  );

  return {
    data,
    isLoading,
    error,
    mutate,
  };
}

export { useMeetingDetail };
