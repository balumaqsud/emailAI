import type { EmailType } from "@/src/features/dashboard/types";

export interface InboxAiRowProps {
  subject: string;
  from: string;
  date: string;
  messageId?: string;
  classification?: { type: EmailType; confidence: number };
  extraction?: {
    status: "processing" | "done" | "failed";
    type: EmailType;
    confidence?: number;
    missingFields?: string[];
    warnings?: string[];
    extractedData?: Record<string, unknown> | null;
  };
  onClick?: () => void;
  onShowDetails?: (messageId: string) => void;
  unread?: boolean;
  className?: string;
}

const TYPE_LABELS: Record<EmailType, string> = {
  invoice: "Invoice",
  meeting: "Meeting",
  support: "Support",
  job_application: "Job",
  general: "General",
};

function safeStr(d: Record<string, unknown> | null | undefined, key: string): string {
  if (!d || typeof d !== "object") return "";
  const v = d[key];
  return typeof v === "string" ? v : "";
}

function safeNum(d: Record<string, unknown> | null | undefined, key: string): number | null {
  if (!d || typeof d !== "object") return null;
  const v = d[key];
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  return null;
}

function summaryLine(
  type: EmailType,
  extractedData: Record<string, unknown> | null | undefined,
): string {
  if (!extractedData || typeof extractedData !== "object") return "—";

  switch (type) {
    case "invoice": {
      const invoice = extractedData.invoice as Record<string, unknown> | undefined;
      const vendor = safeStr(extractedData, "company");
      const total = invoice ? safeNum(invoice, "amount") : null;
      const due = invoice ? safeStr(invoice, "due_date") : "";
      const parts = [vendor || "—", total != null ? String(total) : "", due].filter(Boolean);
      return parts.length > 0 ? parts.join(" · ") : "—";
    }
    case "meeting": {
      const meeting = extractedData.meeting as Record<string, unknown> | undefined;
      const topic = meeting ? safeStr(meeting, "topic") : "";
      const start = meeting ? safeStr(meeting, "proposed_time") : "";
      const parts = [topic || "—", start].filter(Boolean);
      return parts.length > 0 ? parts.join(" · ") : "—";
    }
    case "support": {
      const intent = safeStr(extractedData, "intent");
      const ticket = extractedData.ticket as Record<string, unknown> | undefined;
      const deal = extractedData.deal as Record<string, unknown> | undefined;
      if (intent === "create_ticket") {
        const issue = ticket ? safeStr(ticket, "issue") : "";
        const priority = ticket ? safeStr(ticket, "priority") : "";
        const urgency = ticket ? safeStr(ticket, "urgency_reason") : "";
        const parts = [priority || "", issue || "—", urgency].filter(Boolean);
        return parts.length > 0 ? parts.join(" · ") : "—";
      }
      if (intent === "create_deal" || intent === "create_lead") {
        const product = deal ? safeStr(deal, "product") : "";
        const usersRequested =
          deal && typeof (deal.users_requested as unknown) === "number"
            ? String(deal.users_requested as unknown as number)
            : "";
        const task = extractedData.task as Record<string, unknown> | undefined;
        const action = task ? safeStr(task, "action") : "";
        const parts = [product || "—", usersRequested, action].filter(Boolean);
        return parts.length > 0 ? parts.join(" · ") : "—";
      }
      const ticketId = safeStr(extractedData, "ticketId");
      const priority = safeStr(extractedData, "priority");
      const parts = [ticketId || "—", priority].filter(Boolean);
      return parts.length > 0 ? parts.join(" · ") : "—";
    }
    case "job_application": {
      const company = safeStr(extractedData, "company");
      const role = safeStr(extractedData, "role");
      const nextInterview = safeStr(extractedData, "interviewTime");
      const parts = [company || "—", role || "—", nextInterview].filter(Boolean);
      return parts.length > 0 ? parts.join(" · ") : "—";
    }
    case "general": {
      const summary = safeStr(extractedData, "summary");
      return summary || "—";
    }
    default:
      return "—";
  }
}

export function InboxAiRow({
  subject,
  from,
  date,
  messageId,
  classification,
  extraction,
  onClick,
  onShowDetails,
  unread = false,
  className = "",
}: InboxAiRowProps) {
  const typeLabel = classification
    ? TYPE_LABELS[classification.type] ?? classification.type
    : null;
  const confPercent =
    classification && typeof classification.confidence === "number"
      ? Math.round(classification.confidence * 100)
      : null;
  const status = extraction?.status ?? null;
  const aiLine =
    extraction?.extractedData != null && extraction?.type
      ? summaryLine(extraction.type, extraction.extractedData)
      : "—";

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`flex cursor-pointer gap-3 rounded-2xl bg-white/80 px-3 py-3 text-xs shadow-sm ring-1 ring-slate-100 hover:bg-sky-50/70 ${unread ? "border-l-4 border-sky-500" : ""} ${className}`}
    >
      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-500 text-[13px] font-semibold text-white">
        {from[0]?.toUpperCase() ?? "?"}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[11px] font-semibold text-slate-800">
            {from}
          </p>
          <p className="whitespace-nowrap text-[10px] text-slate-400">{date}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[11px] font-semibold text-slate-900">
            {subject}
          </p>
          {typeLabel && (
            <span className="shrink-0 rounded-full bg-sky-100 px-2 py-0.5 text-[9px] font-medium text-sky-700">
              {typeLabel}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {confPercent != null && (
            <span className="text-[10px] text-slate-500">
              Conf: {confPercent}%
            </span>
          )}
          {status && (
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-[9px] ${
                status === "failed"
                  ? "bg-rose-100 text-rose-700"
                  : status === "processing"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {status}
            </span>
          )}
          {messageId && (
            <button
              type="button"
              className="ml-auto rounded-full border border-sky-100 bg-sky-50 px-2 py-0.5 text-[9px] font-medium text-sky-700 hover:bg-sky-100"
              onClick={(e) => {
                e.stopPropagation();
                onShowDetails?.(messageId);
              }}
            >
              AI details
            </button>
          )}
        </div>
        <p className="truncate text-[10px] text-slate-500">{aiLine}</p>
      </div>
    </article>
  );
}
