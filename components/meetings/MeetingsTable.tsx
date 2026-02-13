import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { MeetingListItem } from "@/src/features/meetings/types";

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "short",
  timeStyle: "short",
});

function statusVariant(
  status: string,
): "default" | "warning" | "success" | "info" {
  switch (status) {
    case "completed":
      return "success";
    case "in_progress":
      return "info";
    case "failed":
      return "warning";
    default:
      return "default";
  }
}

export interface MeetingsTableProps {
  items: MeetingListItem[];
  onFinalize?: (meeting: MeetingListItem) => void;
  finalizingId?: string | null;
}

export function MeetingsTable({
  items,
  onFinalize,
  finalizingId,
}: MeetingsTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white/80 p-8 text-center text-sm text-slate-500">
        No meetings yet. Schedule one to get started.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white/80 shadow-sm">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50">
            <th className="px-4 py-3 font-medium text-slate-600">Title</th>
            <th className="px-4 py-3 font-medium text-slate-600">Time</th>
            <th className="px-4 py-3 font-medium text-slate-600">Status</th>
            <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((m) => {
            const start = new Date(m.startAt);
            const canFinalize =
              (m.status === "in_progress" || m.status === "scheduled" || m.status === "completed") &&
              onFinalize &&
              finalizingId !== m.id;
            return (
              <tr
                key={m.id}
                className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/meetings/${m.id}`}
                    className="font-medium text-slate-800 hover:text-sky-600"
                  >
                    {m.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {timeFormatter.format(start)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant(m.status)}>{m.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/meetings/${m.id}`}
                      className="rounded-md px-2 py-1 text-sky-600 hover:bg-sky-50"
                    >
                      View
                    </Link>
                    {canFinalize && (
                      <button
                        type="button"
                        onClick={() => onFinalize?.(m)}
                        disabled={!!finalizingId}
                        className="rounded-md px-2 py-1 text-amber-600 hover:bg-amber-50 disabled:opacity-50"
                      >
                        {finalizingId === m.id ? "Finalizing…" : "Finalize"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
