import useSWR from "swr";
import { useAuth } from "@/src/lib/auth/context";
import { fetchTranscript } from "./meetingsClient";
import type { TranscriptChunkDTO } from "./types";

const POLL_INTERVAL_MS = 2500;

function useTranscriptFeed(meetingId: string | null): {
  chunks: TranscriptChunkDTO[];
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
} {
  const { accessToken } = useAuth();

  const { data, error, isLoading, mutate } = useSWR<TranscriptChunkDTO[]>(
    accessToken && meetingId ? ["transcript", meetingId, accessToken] : null,
    ([, id, token]) => fetchTranscript(token as string, id as string),
    {
      refreshInterval: POLL_INTERVAL_MS,
      revalidateOnFocus: false,
      dedupingInterval: 1_000,
    },
  );

  return {
    chunks: data ?? [],
    isLoading,
    error,
    mutate,
  };
}

export { useTranscriptFeed };
