import { useState } from "react";
import type { EmailAiDetails } from "@/src/lib/mail/api";

export interface InboxAiDetailsModalProps {
  open: boolean;
  onClose: () => void;
  details: EmailAiDetails | null;
  loading?: boolean;
  error?: string | null;
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

function renderExtractionDetails(
  extraction: NonNullable<EmailAiDetails["extraction"]>,
) {
  const data = extraction.extractedData as
    | Record<string, unknown>
    | null
    | undefined;

  if (!data || typeof data !== "object") {
    return (
      <p className="text-slate-500">
        No structured details are available for this email yet.
      </p>
    );
  }

  const type = extraction.type;

  if (type === "invoice") {
    const intent = safeStr(data, "intent");
    const company = safeStr(data, "company");
    const invoice = data.invoice as Record<string, unknown> | undefined;
    const invoiceNumber = invoice ? safeStr(invoice, "invoice_number") : "";
    const amount = invoice ? safeNum(invoice, "amount") : null;
    const currency = invoice ? safeStr(invoice, "currency") : "";
    const dueDate = invoice ? safeStr(invoice, "due_date") : "";

    return (
      <dl className="mt-1 space-y-0.5 text-[11px] text-slate-700">
        {intent && (
          <div>
            <dt className="inline text-slate-500">Intent: </dt>
            <dd className="inline font-medium">{intent}</dd>
          </div>
        )}
        {company && (
          <div>
            <dt className="inline text-slate-500">Company: </dt>
            <dd className="inline font-medium">{company}</dd>
          </div>
        )}
        {invoiceNumber && (
          <div>
            <dt className="inline text-slate-500">Invoice #: </dt>
            <dd className="inline font-medium">{invoiceNumber}</dd>
          </div>
        )}
        {(amount != null || currency) && (
          <div>
            <dt className="inline text-slate-500">Amount: </dt>
            <dd className="inline font-medium">
              {amount != null ? amount : "—"}
              {currency ? ` ${currency}` : ""}
            </dd>
          </div>
        )}
        {dueDate && (
          <div>
            <dt className="inline text-slate-500">Due date: </dt>
            <dd className="inline font-medium">{dueDate}</dd>
          </div>
        )}
      </dl>
    );
  }

  if (type === "meeting") {
    const meeting = data.meeting as Record<string, unknown> | undefined;
    const contact = data.contact as Record<string, unknown> | undefined;
    const contactName = contact ? safeStr(contact, "name") : "";
    const contactEmail = contact ? safeStr(contact, "email") : "";
    const topic = meeting ? safeStr(meeting, "topic") : "";
    const time = meeting ? safeStr(meeting, "proposed_time") : "";
    const location = meeting ? safeStr(meeting, "location") : "";

    return (
      <dl className="mt-1 space-y-0.5 text-[11px] text-slate-700">
        {contactName && (
          <div>
            <dt className="inline text-slate-500">Contact: </dt>
            <dd className="inline font-medium">{contactName}</dd>
          </div>
        )}
        {contactEmail && (
          <div>
            <dt className="inline text-slate-500">Email: </dt>
            <dd className="inline font-medium">{contactEmail}</dd>
          </div>
        )}
        {topic && (
          <div>
            <dt className="inline text-slate-500">Topic: </dt>
            <dd className="inline font-medium">{topic}</dd>
          </div>
        )}
        {time && (
          <div>
            <dt className="inline text-slate-500">When: </dt>
            <dd className="inline font-medium">{time}</dd>
          </div>
        )}
        {location && (
          <div>
            <dt className="inline text-slate-500">Location: </dt>
            <dd className="inline font-medium">{location}</dd>
          </div>
        )}
      </dl>
    );
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

    return (
      <dl className="mt-1 space-y-0.5 text-[11px] text-slate-700">
        {intent && (
          <div>
            <dt className="inline text-slate-500">Intent: </dt>
            <dd className="inline font-medium">{intent}</dd>
          </div>
        )}
        {contactName && (
          <div>
            <dt className="inline text-slate-500">Contact: </dt>
            <dd className="inline font-medium">{contactName}</dd>
          </div>
        )}
        {contactEmail && (
          <div>
            <dt className="inline text-slate-500">Email: </dt>
            <dd className="inline font-medium">{contactEmail}</dd>
          </div>
        )}
        {company && (
          <div>
            <dt className="inline text-slate-500">Company: </dt>
            <dd className="inline font-medium">{company}</dd>
          </div>
        )}
        {issue && (
          <div>
            <dt className="inline text-slate-500">Issue: </dt>
            <dd className="inline font-medium">{issue}</dd>
          </div>
        )}
        {priority && (
          <div>
            <dt className="inline text-slate-500">Priority: </dt>
            <dd className="inline font-medium">{priority}</dd>
          </div>
        )}
        {urgency && (
          <div>
            <dt className="inline text-slate-500">Urgency: </dt>
            <dd className="inline font-medium">{urgency}</dd>
          </div>
        )}
      </dl>
    );
  }

  if (type === "job_application") {
    const company = safeStr(data, "company");
    const role = safeStr(data, "role");
    const interviewTime = safeStr(data, "interviewTime");

    return (
      <dl className="mt-1 space-y-0.5 text-[11px] text-slate-700">
        {company && (
          <div>
            <dt className="inline text-slate-500">Company: </dt>
            <dd className="inline font-medium">{company}</dd>
          </div>
        )}
        {role && (
          <div>
            <dt className="inline text-slate-500">Role: </dt>
            <dd className="inline font-medium">{role}</dd>
          </div>
        )}
        {interviewTime && (
          <div>
            <dt className="inline text-slate-500">Next interview: </dt>
            <dd className="inline font-medium">{interviewTime}</dd>
          </div>
        )}
      </dl>
    );
  }

  if (type === "general") {
    const summary = safeStr(data, "summary");
    const keyEntities = Array.isArray((data as any).keyEntities)
      ? ((data as any).keyEntities as unknown[]).filter(
          (v) => typeof v === "string",
        )
      : [];

    return (
      <div className="mt-1 space-y-0.5 text-[11px] text-slate-700">
        {summary && (
          <p>
            <span className="text-slate-500">Summary: </span>
            <span className="font-medium">{summary}</span>
          </p>
        )}
        {keyEntities.length > 0 && (
          <p className="text-[10px] text-slate-500">
            Key entities: {keyEntities.join(", ")}
          </p>
        )}
      </div>
    );
  }

  return (
    <p className="mt-1 text-[11px] text-slate-500">
      No specific details formatter is defined for this email type.
    </p>
  );
}

export function InboxAiDetailsModal({
  open,
  onClose,
  details,
  loading = false,
  error = null,
}: InboxAiDetailsModalProps) {
  if (!open) return null;

  const classification = details?.classification ?? null;
  const extraction = details?.extraction ?? null;
  const message = details?.message ?? null;
  const [showTechnical, setShowTechnical] = useState(false);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-3"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inbox-ai-details-title"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-lg rounded-2xl bg-white p-4 text-xs shadow-xl ring-1 ring-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2
            id="inbox-ai-details-title"
            className="text-[11px] font-semibold text-slate-800"
          >
            AI analysis details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-2 py-0.5 text-[10px] text-slate-500 hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        {message && (
          <div className="mb-2 border-b border-slate-100 pb-2 text-[10px] text-slate-500">
            <p className="truncate text-[11px] font-medium text-slate-800">
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
            {classification && (
              <section className="rounded-xl bg-slate-50 p-2">
                <h3 className="mb-1 text-[10px] font-semibold text-slate-700">
                  Classification
                </h3>
                <p className="text-slate-600">
                  Type:{" "}
                  <span className="font-medium">{classification.type}</span>
                </p>
              </section>
            )}

            {extraction && (
              <section className="rounded-xl bg-slate-50 p-2">
                <h3 className="mb-1 text-[10px] font-semibold text-slate-700">
                  Extraction
                </h3>
                <p className="text-slate-600">
                  Status:{" "}
                  <span className="font-medium">{extraction.status}</span>
                </p>
                <p className="text-slate-600">
                  Type: <span className="font-medium">{extraction.type}</span>
                </p>
                <p className="text-slate-600">
                  Confidence:{" "}
                  <span className="font-medium">
                    {extraction.confidence != null
                      ? `${Math.round(extraction.confidence * 100)}%`
                      : "—"}
                  </span>
                </p>
                {renderExtractionDetails(extraction)}
              </section>
            )}

            {(message || classification || extraction) && (
              <section className="rounded-xl bg-slate-50 p-2">
                <button
                  type="button"
                  className="mb-1 text-[10px] font-medium text-sky-700 hover:underline"
                  onClick={() => setShowTechnical((v) => !v)}
                >
                  {showTechnical ? "Hide technical details" : "Show technical details"}
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
                        Classification model: {classification.modelName} · Prompt v
                        {classification.promptVersion}
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
                            Missing fields: {extraction.missingFields.join(", ")}
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
                              {JSON.stringify(extraction.extractedData, null, 2)}
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
