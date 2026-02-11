import type { NeedsReviewItem } from "@/src/features/dashboard/types";

export interface NeedsReviewTableProps {
  items: NeedsReviewItem[];
  onMessageClick?: (messageId: string) => void;
}

const TYPE_LABELS: Record<string, string> = {
  invoice: "Invoice",
  meeting: "Meeting",
  support: "Support",
  job_application: "Job",
  general: "General",
};

export function NeedsReviewTable({
  items,
  onMessageClick,
}: NeedsReviewTableProps) {
  if (items.length === 0) {
    return (
      <section className="rounded-xl bg-white/90 p-2.5 shadow-sm ring-1 ring-slate-100">
        <h2 className="mb-1.5 text-[11px] font-semibold text-slate-800">
          Needs review
        </h2>
        <p className="text-[11px] text-slate-500">No items need review.</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl bg-white/90 p-2.5 shadow-sm ring-1 ring-slate-100">
      <h2 className="mb-1.5 text-[11px] font-semibold text-slate-800">
        Needs review
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="pb-1 pr-1.5 font-medium">Message</th>
              <th className="pb-1 pr-1.5 font-medium">Type</th>
              <th className="pb-1 pr-1.5 font-medium">Status</th>
              <th className="pb-1 pr-1.5 font-medium">Conf.</th>
              <th className="pb-1 pr-1.5 font-medium">Issues</th>
              <th className="pb-1 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr
                key={row.messageId}
                className="border-b border-slate-100 hover:bg-slate-50/80"
              >
                <td className="py-1 pr-1.5">
                  <button
                    type="button"
                    onClick={() => onMessageClick?.(row.messageId)}
                    className="max-w-[120px] truncate text-left text-sky-600 underline hover:text-sky-700"
                  >
                    {row.messageId}
                  </button>
                </td>
                <td className="py-1 pr-1.5 text-slate-700">
                  {TYPE_LABELS[row.type] ?? row.type}
                </td>
                <td className="py-1 pr-1.5">
                  <span
                    className={`inline-block rounded-full px-1.5 py-0.5 text-[9px] ${
                      row.status === "failed"
                        ? "bg-rose-100 text-rose-700"
                        : row.status === "processing"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="py-1 pr-1.5 text-slate-600">
                  {row.confidence != null
                    ? `${Math.round(row.confidence * 100)}%`
                    : "—"}
                </td>
                <td className="max-w-[100px] py-1 pr-1.5 text-slate-500">
                  {row.missingFields.length > 0 && (
                    <span title={row.missingFields.join(", ")}>
                      Missing: {row.missingFields.length}
                    </span>
                  )}
                  {row.warnings.length > 0 && (
                    <span className="ml-1" title={row.warnings.join(", ")}>
                      Warn: {row.warnings.length}
                    </span>
                  )}
                  {row.missingFields.length === 0 &&
                    row.warnings.length === 0 &&
                    "—"}
                </td>
                <td className="whitespace-nowrap py-1 text-[9px] text-slate-500">
                  {row.updatedAt
                    ? new Date(row.updatedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
