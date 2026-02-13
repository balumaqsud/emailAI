import { useRouter } from "next/router";
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
  onDelete?: (meeting: MeetingListItem) => void;
  deletingId?: string | null;
}

export function MeetingsTable({
  items,
  onFinalize,
  finalizingId,
  onDelete,
  deletingId,
}: MeetingsTableProps) {
  const router = useRouter();

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
                className="cursor-pointer border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50"
                onClick={() => router.push(`/meetings/${m.id}`)}
              >
                <td className="px-4 py-3 font-medium text-slate-800">
                  {m.title}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {timeFormatter.format(start)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant(m.status)}>{m.status}</Badge>
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
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
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(m)}
                        disabled={!!deletingId}
                        className="rounded-md px-2 py-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === m.id ? "Deleting…" : "Delete"}
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
