import type { DashboardPipeline } from "@/src/features/dashboard/types";

export interface AiPipelineCardProps {
  pipeline: DashboardPipeline;
}

function formatPercent(value: number | null): string {
  if (value == null) return "—";
  return `${Math.round(value * 100)}%`;
}

export function AiPipelineCard({ pipeline }: AiPipelineCardProps) {
  const {
    processing,
    done,
    failed,
    needsReview,
    stuck,
    avgExtractionConfidence,
    avgClassificationConfidence,
  } = pipeline;

  return (
    <section className="rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-slate-100">
      <h2 className="mb-3 text-sm font-semibold text-slate-800">
        AI pipeline health
      </h2>
      <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 px-3 py-2">
          <span className="text-slate-500">Processing</span>
          <p className="font-semibold text-slate-800">{processing}</p>
        </div>
        <div className="rounded-xl bg-emerald-50 px-3 py-2">
          <span className="text-emerald-600">Done</span>
          <p className="font-semibold text-emerald-800">{done}</p>
        </div>
        <div className="rounded-xl bg-rose-50 px-3 py-2">
          <span className="text-rose-600">Failed</span>
          <p className="font-semibold text-rose-800">{failed}</p>
        </div>
        <div className="rounded-xl bg-amber-50 px-3 py-2">
          <span className="text-amber-600">Needs review</span>
          <p className="font-semibold text-amber-800">{needsReview}</p>
        </div>
        <div className="rounded-xl bg-orange-50 px-3 py-2">
          <span className="text-orange-600">Stuck</span>
          <p className="font-semibold text-orange-800">{stuck}</p>
        </div>
        <div className="col-span-2 rounded-xl bg-sky-50 px-3 py-2 sm:col-span-1">
          <span className="text-sky-600">Avg confidence</span>
          <p className="font-semibold text-sky-800">
            Ext: {formatPercent(avgExtractionConfidence)} / Cls:{" "}
            {formatPercent(avgClassificationConfidence)}
          </p>
        </div>
      </div>
    </section>
  );
}
