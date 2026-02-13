import type { TranscriptChunkDTO } from "@/src/features/meetings/types";

export interface TranscriptFeedProps {
  chunks: TranscriptChunkDTO[];
  isLoading?: boolean;
}

export function TranscriptFeed({ chunks, isLoading }: TranscriptFeedProps) {
  if (chunks.length === 0 && !isLoading) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white/80 p-6 text-center text-sm text-slate-500">
        No transcript yet. Transcription appears in real-time during the meeting.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white/80 p-4">
      {isLoading && chunks.length === 0 && (
        <div className="py-4 text-center text-sm text-slate-400">
          Loading transcript…
        </div>
      )}
      <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
        {chunks.map((c) => (
          <div
            key={c.id}
            className="rounded-lg bg-slate-50/80 px-3 py-2 text-xs"
          >
            {c.speakerName ? (
              <span className="font-medium text-slate-600">
                {c.speakerName}:{" "}
              </span>
            ) : null}
            <span className="text-slate-800">{c.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
