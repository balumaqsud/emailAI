import type { DashboardHighlights } from "@/src/features/dashboard/types";

export interface IdentifiedHighlightsProps {
  highlights: DashboardHighlights;
}

export function IdentifiedHighlights({
  highlights,
}: IdentifiedHighlightsProps) {
  const { invoices, meetings, support, jobs } = highlights;

  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/82fb972f-c31b-4021-b252-62d4c5e26664", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "components/dashboard/IdentifiedHighlights.tsx:render",
      message: "IdentifiedHighlights props",
      data: {
        invoices,
        meetings,
        support,
        jobs,
      },
      timestamp: Date.now(),
      runId: "pre-fix",
      hypothesisId: "H_overview_frontend",
    }),
  }).catch(() => {});
  // #endregion

  return (
    <section className="rounded-xl bg-white/90 p-2.5 shadow-sm ring-1 ring-slate-100">
      <h2 className="mb-1.5 text-[11px] font-semibold text-slate-800">
        Identified highlights
      </h2>
      <div className="grid gap-1.5 sm:grid-cols-2">
        <div className="rounded-lg bg-slate-50 p-2 text-[11px]">
          <h3 className="mb-0.5 font-medium text-slate-700">Invoices</h3>
          <p className="text-slate-600">
            {invoices.count} total · {invoices.unpaidCount} unpaid · Sum:{" "}
            {invoices.totalAmountSum > 0
              ? String(invoices.totalAmountSum)
              : "—"}
          </p>
          {invoices.vendorsTop.length > 0 && (
            <p className="mt-0.5 text-[10px] text-slate-500">
              Top: {invoices.vendorsTop.join(", ")}
            </p>
          )}
        </div>
        <div className="rounded-lg bg-slate-50 p-2 text-[11px]">
          <h3 className="mb-0.5 font-medium text-slate-700">Meetings</h3>
          <p className="text-slate-600">
            {meetings.upcomingCount} upcoming
            {meetings.nextMeetingStart
              ? ` · Next: ${meetings.nextMeetingStart}`
              : ""}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 p-2 text-[11px]">
          <h3 className="mb-0.5 font-medium text-slate-700">Support</h3>
          <p className="text-slate-600">
            {support.openCount} open · {support.urgentCount} urgent
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 p-2 text-[11px]">
          <h3 className="mb-0.5 font-medium text-slate-700">Jobs</h3>
          <p className="text-slate-600">
            {jobs.activeCount} active
            {jobs.nextInterviewTime
              ? ` · Next interview: ${jobs.nextInterviewTime}`
              : ""}
          </p>
        </div>
      </div>
    </section>
  );
}
