import type { EmailType } from "@/src/features/dashboard/types";

export interface TypeDistributionChartProps {
  distribution: Record<EmailType, number>;
}

const TYPE_LABELS: Record<EmailType, string> = {
  invoice: "Invoice",
  meeting: "Meeting",
  support: "Support",
  job_application: "Job application",
  general: "General",
};

const COLORS = [
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-slate-400",
];

export function TypeDistributionChart({
  distribution,
}: TypeDistributionChartProps) {
  const entries = (
    Object.entries(distribution) as [EmailType, number][]
  ).filter(([, n]) => n > 0);
  const total = entries.reduce((s, [, n]) => s + n, 0);
  const max = Math.max(...entries.map(([, n]) => n), 1);

  return (
    <section className="rounded-xl bg-white/90 p-2.5 shadow-sm ring-1 ring-slate-100">
      <h2 className="mb-1.5 text-[11px] font-semibold text-slate-800">
        Type distribution
      </h2>
      {entries.length === 0 ? (
        <p className="text-[11px] text-slate-500">No data in range.</p>
      ) : (
        <div className="space-y-1">
          {entries.map(([type, count], i) => (
            <div key={type} className="flex items-center gap-1.5">
              <span className="w-20 shrink-0 text-[10px] text-slate-600">
                {TYPE_LABELS[type]}
              </span>
              <div className="min-w-0 flex-1">
                <div
                  className={`h-4 rounded ${COLORS[i % COLORS.length]}`}
                  style={{
                    width: `${(count / max) * 100}%`,
                    minWidth: count > 0 ? "4px" : "0",
                  }}
                  title={`${count} (${
                    total ? Math.round((count / total) * 100) : 0
                  }%)`}
                />
              </div>
              <span className="w-6 text-right text-[10px] font-medium text-slate-700">
                {count}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
