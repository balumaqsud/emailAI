import type { DashboardHighlights } from "@/src/features/dashboard/types";

export interface IdentifiedHighlightsProps {
  highlights: DashboardHighlights;
}

export function IdentifiedHighlights({
  highlights,
}: IdentifiedHighlightsProps) {
  const { invoices, meetings, support, jobs } = highlights;

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
