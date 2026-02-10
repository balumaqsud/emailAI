import { DonutChart } from "./DonutChart";
import { StatsCard } from "./StatsCard";

export function InsightsPanel() {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="rounded-2xl bg-white/90 p-3 shadow-sm ring-1 ring-slate-100">
        <div className="mb-2 flex items-center justify-between gap-2 text-xs">
          <p className="font-semibold text-slate-800">Incoming Email Stats</p>
          <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-600">
            Today
          </span>
        </div>
        <div className="flex items-center gap-3">
          <DonutChart />
          <div className="space-y-1 text-[11px] text-slate-600">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sky-400" />
              <p>395 Zoom conversations</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <p>24 Unread emails</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <p>6 Important emails</p>
            </div>
          </div>
        </div>
      </div>

      <StatsCard
        title="Total Conversations"
        value="385"
        subtitle="24 Unread • 6 Important"
      />
      <StatsCard
        title="Pegged for Review"
        value="3"
        subtitle="Needs your attention"
      />

      <div className="mt-1 space-y-2 text-xs">
        <section className="rounded-2xl bg-white/90 p-3 shadow-sm ring-1 ring-slate-100">
          <p className="mb-1 text-[11px] font-semibold text-slate-800">
            Important
          </p>
          <p className="text-[10px] text-slate-500">Contact details</p>
          <p className="text-[10px] text-slate-500">Review unread</p>
        </section>

        <section className="rounded-2xl bg-white/90 p-3 shadow-sm ring-1 ring-slate-100">
          <p className="mb-1 text-[11px] font-semibold text-slate-800">
            Finance
          </p>
          <p className="text-[10px] text-slate-500">Payments</p>
          <p className="text-[10px] text-slate-500">Invoices</p>
        </section>
      </div>
    </div>
  );
}

