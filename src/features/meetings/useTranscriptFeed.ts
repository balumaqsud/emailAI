import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/src/lib/auth/context";
import { fetchFullTranscript, fetchTranscript } from "./meetingsClient";
import type { TranscriptChunkDTO } from "./types";

const POLL_INTERVAL_MS = 2500;

function useTranscriptFeed(meetingId: string | null): {
  chunks: TranscriptChunkDTO[];
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
} {
  const { accessToken } = useAuth();

  const [chunks, setChunks] = useState<TranscriptChunkDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>();

  const lastSeqRef = useRef<number | undefined>(undefined);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Reset state when dependencies change
    setChunks([]);
    setError(undefined);
    setIsLoading(false);

    if (!accessToken || !meetingId) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    let cancelled = false;

    async function loadInitial() {
      setIsLoading(true);
      setError(undefined);

      try {
        const all = await fetchFullTranscript(accessToken, meetingId);
        if (cancelled) return;

        setChunks(all);
        lastSeqRef.current = all.length ? all[all.length - 1]!.seq : undefined;
      } catch (err) {
        if (cancelled) return;
        const e =
          err instanceof Error
            ? err
            : new Error("Failed to load transcript.");
        setError(e);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadInitial();

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(async () => {
      if (cancelled) return;

      const lastSeq = lastSeqRef.current;

      try {
        const batch = await fetchTranscript(accessToken, meetingId, lastSeq);
        if (cancelled || batch.length === 0) {
          return;
        }

        setChunks((prev) => {
          const next = [...prev, ...batch];
          return next;
        });

        lastSeqRef.current = batch[batch.length - 1]!.seq;
      } catch (err) {
        if (cancelled) return;
        const e =
          err instanceof Error
            ? err
            : new Error("Failed to update transcript.");
        setError(e);
      }
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [accessToken, meetingId]);

  const mutate = () => {
    if (!accessToken || !meetingId) {
      setChunks([]);
      lastSeqRef.current = undefined;
      return;
    }

    let cancelled = false;

    async function reload() {
      setIsLoading(true);
      setError(undefined);

      try {
        const all = await fetchFullTranscript(accessToken, meetingId);
        if (cancelled) return;

        setChunks(all);
        lastSeqRef.current = all.length ? all[all.length - 1]!.seq : undefined;
      } catch (err) {
        if (cancelled) return;
        const e =
          err instanceof Error
            ? err
            : new Error("Failed to reload transcript.");
        setError(e);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void reload();
  };

  return {
    chunks,
    isLoading,
    error,
    mutate,
  };
}

export { useTranscriptFeed };
