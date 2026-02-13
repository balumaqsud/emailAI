import type { MeetingDetail } from "@/src/features/meetings/types";

export interface MeetingSummaryCardProps {
  meeting: MeetingDetail;
}

export function MeetingSummaryCard({ meeting }: MeetingSummaryCardProps) {
  const artifact = meeting.artifact;
  if (!artifact) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white/80 p-6 text-center text-sm text-slate-500">
        No summary yet. Finalize the meeting to generate AI summary and action
        items.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-100 bg-white/80 p-6">
      {artifact.summary && (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Summary
          </h3>
          <p className="text-sm text-slate-700">{artifact.summary}</p>
        </section>
      )}
      {artifact.topics && artifact.topics.length > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Topics
          </h3>
          <ul className="flex flex-wrap gap-2">
            {artifact.topics.map((t, i) => (
              <li
                key={i}
                className="rounded-full bg-sky-50 px-2.5 py-1 text-xs text-sky-700"
              >
                {t}
              </li>
            ))}
          </ul>
        </section>
      )}
      {artifact.actionItems && artifact.actionItems.length > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Action Items
          </h3>
          <ul className="space-y-2">
            {artifact.actionItems.map((a, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded-lg bg-amber-50/80 px-3 py-2 text-xs"
              >
                <span className="mt-0.5 shrink-0 text-amber-600">•</span>
                <div>
                  <span className="text-slate-800">{a.text}</span>
                  {(a.owner || a.dueAt) && (
                    <span className="ml-2 text-slate-500">
                      {a.owner && `(${a.owner})`}
                      {a.dueAt && ` — ${a.dueAt}`}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
