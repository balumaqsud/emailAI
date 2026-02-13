import { useMemo, useState } from "react";
import type { EmailAiDetails } from "@/src/lib/mail/api";

export interface InboxAiDetailsModalProps {
  open: boolean;
  onClose: () => void;
  details: EmailAiDetails | null;
  loading?: boolean;
  error?: string | null;
}

interface DetailRow {
  label: string;
  value: string;
}

function safeStr(
  d: Record<string, unknown> | null | undefined,
  key: string,
): string {
  if (!d || typeof d !== "object") return "";
  const v = d[key];
  return typeof v === "string" ? v : "";
}

function safeNum(
  d: Record<string, unknown> | null | undefined,
  key: string,
): number | null {
  if (!d || typeof d !== "object") return null;
  const v = d[key];
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  return null;
}

function DetailsTable({ rows }: { rows: DetailRow[] }) {
  const visibleRows = rows.filter((row) => row.value.trim().length > 0);

  if (visibleRows.length === 0) {
    return (
      <p className="text-[11px] text-slate-500">
        No structured details are available for this email yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full border-collapse text-[11px]">
        <thead>
          <tr className="bg-slate-50 text-left text-slate-500">
            <th className="px-3 py-1.5 font-medium">Field</th>
            <th className="px-3 py-1.5 font-medium">Value</th>
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row) => (
            <tr
              key={row.label}
              className="border-t border-slate-200 odd:bg-white even:bg-slate-50/40"
            >
              <td className="whitespace-nowrap px-3 py-1.5 text-slate-600">
                {row.label}
              </td>
              <td className="px-3 py-1.5 text-slate-800">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function buildExtractionRows(
  extraction: NonNullable<EmailAiDetails["extraction"]>,
): DetailRow[] {
  const data = extraction.extractedData as
    | Record<string, unknown>
    | null
    | undefined;

  const type = extraction.type;

  if (!data || typeof data !== "object") {
    return [
      {
        label: "Status",
        value: extraction.status,
      },
      {
        label: "Type",
        value: type,
      },
      {
        label: "Confidence",
        value:
          extraction.confidence != null
            ? `${Math.round(extraction.confidence * 100)}%`
            : "",
      },
    ];
  }

  if (type === "invoice") {
    const intent = safeStr(data, "intent");
    const company = safeStr(data, "company");
    const invoice = data.invoice as Record<string, unknown> | undefined;
    const invoiceNumber = invoice ? safeStr(invoice, "invoice_number") : "";
    const amount = invoice ? safeNum(invoice, "amount") : null;
    const currency = invoice ? safeStr(invoice, "currency") : "";
    const dueDate = invoice ? safeStr(invoice, "due_date") : "";

    return [
      { label: "Status", value: extraction.status },
      {
        label: "Confidence",
        value:
          extraction.confidence != null
            ? `${Math.round(extraction.confidence * 100)}%`
            : "",
      },
      { label: "Intent", value: intent },
      { label: "Company", value: company },
      { label: "Invoice #", value: invoiceNumber },
      {
        label: "Amount",
        value:
          amount != null || currency
            ? `${amount != null ? amount : "—"}${
                currency ? ` ${currency}` : ""
              }`
            : "",
      },
      { label: "Due date", value: dueDate },
    ];
  }

  if (type === "meeting") {
    const meeting = data.meeting as Record<string, unknown> | undefined;
    const contact = data.contact as Record<string, unknown> | undefined;
    const contactName = contact ? safeStr(contact, "name") : "";
    const contactEmail = contact ? safeStr(contact, "email") : "";
    const topic = meeting ? safeStr(meeting, "topic") : "";
    const time = meeting ? safeStr(meeting, "proposed_time") : "";
    const location = meeting ? safeStr(meeting, "location") : "";

    return [
      { label: "Status", value: extraction.status },
      {
        label: "Confidence",
        value:
          extraction.confidence != null
            ? `${Math.round(extraction.confidence * 100)}%`
            : "",
      },
      { label: "Contact", value: contactName },
      { label: "Email", value: contactEmail },
      { label: "Topic", value: topic },
      { label: "When", value: time },
      { label: "Location", value: location },
    ];
  }

  if (type === "support") {
    const intent = safeStr(data, "intent");
    const ticket = data.ticket as Record<string, unknown> | undefined;
    const issue = ticket ? safeStr(ticket, "issue") : "";
    const priority = ticket ? safeStr(ticket, "priority") : "";
    const urgency = ticket ? safeStr(ticket, "urgency_reason") : "";
    const contact = data.contact as Record<string, unknown> | undefined;
    const contactName = contact ? safeStr(contact, "name") : "";
    const contactEmail = contact ? safeStr(contact, "email") : "";
    const company = safeStr(data, "company");

    return [
      { label: "Status", value: extraction.status },
      {
        label: "Confidence",
        value:
          extraction.confidence != null
            ? `${Math.round(extraction.confidence * 100)}%`
            : "",
      },
      { label: "Intent", value: intent },
      { label: "Contact", value: contactName },
      { label: "Email", value: contactEmail },
      { label: "Company", value: company },
      { label: "Issue", value: issue },
      { label: "Priority", value: priority },
      { label: "Urgency", value: urgency },
    ];
  }

  if (type === "job_application") {
    const company = safeStr(data, "company");
    const role = safeStr(data, "role");
    const interviewTime = safeStr(data, "interviewTime");

    return [
      { label: "Status", value: extraction.status },
      {
        label: "Confidence",
        value:
          extraction.confidence != null
            ? `${Math.round(extraction.confidence * 100)}%`
            : "",
      },
      { label: "Company", value: company },
      { label: "Role", value: role },
      { label: "Next interview", value: interviewTime },
    ];
  }

  if (type === "general") {
    const summary = safeStr(data, "summary");
    const keyEntities = Array.isArray((data as any).keyEntities)
      ? ((data as any).keyEntities as unknown[]).filter(
          (v) => typeof v === "string",
        )
      : [];

    return [
      { label: "Status", value: extraction.status },
      {
        label: "Confidence",
        value:
          extraction.confidence != null
            ? `${Math.round(extraction.confidence * 100)}%`
            : "",
      },
      { label: "Summary", value: summary },
      {
        label: "Key entities",
        value: keyEntities.length > 0 ? keyEntities.join(", ") : "",
      },
    ];
  }

  return [
    { label: "Status", value: extraction.status },
    { label: "Type", value: type },
    {
      label: "Confidence",
      value:
        extraction.confidence != null
          ? `${Math.round(extraction.confidence * 100)}%`
          : "",
    },
  ];
}

export function InboxAiDetailsModal({
  open,
  onClose,
  details,
  loading = false,
  error = null,
}: InboxAiDetailsModalProps) {
  const classification = details?.classification ?? null;
  const extraction = details?.extraction ?? null;
  const message = details?.message ?? null;
  const [showTechnical, setShowTechnical] = useState(false);

  const classificationRows: DetailRow[] = useMemo(() => {
    if (!classification) return [];
    return [
      { label: "Type", value: classification.type },
      {
        label: "Confidence",
        value:
          classification.confidence != null
            ? `${Math.round(classification.confidence * 100)}%`
            : "",
      },
    ];
  }, [classification]);

  const extractionRows: DetailRow[] = useMemo(() => {
    if (!extraction) return [];
    return buildExtractionRows(extraction);
  }, [extraction]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-3 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inbox-ai-details-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-xl rounded-2xl bg-white p-4 text-xs shadow-xl ring-1 ring-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
          <h2
            id="inbox-ai-details-title"
            className="text-[12px] font-semibold text-slate-900"
          >
            AI analysis details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-slate-200 px-2 py-0.5 text-[10px] text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        {message && (
          <div className="mb-3 text-[10px] text-slate-500">
            <p className="truncate text-[11px] font-medium text-slate-900">
              {message.subject ?? "(no subject)"}
            </p>
          </div>
        )}

        {loading && (
          <p className="text-[11px] text-slate-500">Loading AI details…</p>
        )}

        {!loading && error && (
          <p className="text-[11px] text-rose-600">{error}</p>
        )}

        {!loading && !error && !classification && !extraction && (
          <p className="text-[11px] text-slate-500">
            No AI analysis is available yet for this email.
          </p>
        )}

        {!loading && !error && (classification || extraction) && (
          <div className="space-y-3 overflow-y-auto text-[11px]">
            <section className="space-y-2">
              {classification && (
                <div>
                  <h3 className="mb-1 text-[10px] font-semibold text-slate-700">
                    Classification
                  </h3>
                  <DetailsTable rows={classificationRows} />
                </div>
              )}

              {extraction && (
                <div>
                  <h3 className="mb-1 text-[10px] font-semibold text-slate-700">
                    Extraction
                  </h3>
                  <DetailsTable rows={extractionRows} />
                </div>
              )}
            </section>

            {(message || classification || extraction) && (
              <section className="mt-1 border-t border-slate-200 pt-2">
                <button
                  type="button"
                  className="mb-1 text-[10px] font-medium text-sky-700 hover:underline"
                  onClick={() => setShowTechnical((v) => !v)}
                >
                  {showTechnical
                    ? "Hide technical details"
                    : "Show technical details"}
                </button>
                {showTechnical && (
                  <div className="space-y-2 text-[10px] text-slate-500">
                    {message && (
                      <p>
                        Message ID:{" "}
                        <span className="font-mono text-[10px] text-slate-600">
                          {message.id}
                        </span>
                      </p>
                    )}
                    {classification && (
                      <p>
                        Classification model: {classification.modelName} ·
                        Prompt v{classification.promptVersion}
                      </p>
                    )}
                    {extraction && (
                      <>
                        <p>
                          Extraction model: {extraction.modelName} · Prompt v
                          {extraction.promptVersion} · Schema v
                          {extraction.schemaVersion}
                        </p>
                        {extraction.missingFields.length > 0 && (
                          <p>
                            Missing fields:{" "}
                            {extraction.missingFields.join(", ")}
                          </p>
                        )}
                        {extraction.warnings.length > 0 && (
                          <p className="text-amber-600">
                            Warnings: {extraction.warnings.join(", ")}
                          </p>
                        )}
                        {extraction.extractedData && (
                          <div>
                            <p className="mb-1 text-[10px] font-semibold text-slate-700">
                              Raw extracted data
                            </p>
                            <pre className="max-h-40 overflow-auto rounded-lg bg-slate-900 px-2 py-1 text-[9px] text-slate-100">
                              {JSON.stringify(
                                extraction.extractedData,
                                null,
                                2,
                              )}
                            </pre>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
