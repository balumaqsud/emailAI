import { useState, type HTMLAttributes } from "react";
import { useAuth } from "@/src/lib/auth/context";
import { getEmailAnalysis } from "@/src/lib/mail/api";
import type { EmailAnalysis } from "@/src/lib/mail/types";
import { Badge } from "../ui/Badge";
import { Labels } from "./Labels";

export interface MailListItemProps extends HTMLAttributes<HTMLDivElement> {
  from: string;
  subject: string;
  preview: string;
  time: string;
  messageId: string;
  meta?: string;
  labels?: string[];
  tag?: "Meeting" | "Important" | "Work" | "Shopping" | "Finance" | "None";
  unread?: boolean;
}

const tagStyles: Record<
  NonNullable<MailListItemProps["tag"]>,
  { label: string; variant: "warning" | "info" | "success" | "default" }
> = {
  Meeting: { label: "Meeting", variant: "warning" },
  Important: { label: "Important", variant: "info" },
  Work: { label: "Work", variant: "success" },
  Shopping: { label: "Shopping", variant: "default" },
  Finance: { label: "Finance", variant: "default" },
  None: { label: "", variant: "default" },
};

export function MailListItem({
  from,
  subject,
  preview,
  time,
  messageId,
  meta,
  labels = [],
  tag = "None",
  unread = false,
  className = "",
  ...props
}: MailListItemProps) {
  const MAX_SUBJECT_LENGTH = 80;
  const MAX_PREVIEW_LENGTH = 100;

  const displaySubject =
    subject.length > MAX_SUBJECT_LENGTH
      ? `${subject.slice(0, MAX_SUBJECT_LENGTH).trimEnd()}…`
      : subject;

  const displayPreview =
    preview.length > MAX_PREVIEW_LENGTH
      ? `${preview.slice(0, MAX_PREVIEW_LENGTH).trimEnd()}…`
      : preview;

  const { accessToken } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [analysis, setAnalysis] = useState<EmailAnalysis>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleToggle = async () => {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);

    if (
      nextExpanded &&
      !analysis &&
      !loadingAnalysis &&
      accessToken
    ) {
      try {
        setLoadingAnalysis(true);
        setAnalysisError(null);
        const data = await getEmailAnalysis(messageId, accessToken);
        setAnalysis(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load AI summary.";
        setAnalysisError(message);
      } finally {
        setLoadingAnalysis(false);
      }
    }
  };

  const confidencePercent =
    analysis && typeof analysis.confidence === "number"
      ? Math.round(analysis.confidence * 100)
      : null;

  const typeLabel =
    analysis?.type === "job_application"
      ? "Job application"
      : analysis?.type
        ? analysis.type[0]?.toUpperCase() + analysis.type.slice(1)
        : null;

  const tagInfo = tagStyles[tag];

  return (
    <article
      className={[
        "flex cursor-pointer gap-3 rounded-2xl bg-white/80 px-3 py-3 text-xs shadow-sm ring-1 ring-slate-100 hover:bg-sky-50/70",
        unread ? "border-l-4 border-sky-500" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={handleToggle}
      {...props}
    >
      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-500 text-[13px] font-semibold text-white">
        {from[0]?.toUpperCase()}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[11px] font-semibold text-slate-800">
            {from}
          </p>
          <p className="whitespace-nowrap text-[10px] text-slate-400">{time}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[11px] font-semibold text-slate-900">
            {displaySubject}
          </p>
          {tag !== "None" && tagInfo.label && (
            <Badge
              variant={tagInfo.variant}
              className="whitespace-nowrap px-2 py-0 text-[10px]"
            >
              {tagInfo.label}
            </Badge>
          )}
        </div>
        <p className="truncate text-[11px] text-slate-500 break-all">
          {displayPreview}
        </p>
        <div className="flex items-center justify-between gap-2">
          {meta && (
            <p className="truncate text-[10px] text-slate-400">{meta}</p>
          )}
          {labels.length > 0 && <Labels labels={labels} />}
        </div>

        {expanded && (
          <div className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-[10px] text-slate-600 ring-1 ring-slate-100">
            {loadingAnalysis && (
              <p className="text-slate-400">Loading AI summary…</p>
            )}
            {analysisError && (
              <p className="text-rose-600">{analysisError}</p>
            )}
            {!loadingAnalysis && !analysisError && analysis && (
              <>
                <div className="mb-1 flex items-center justify-between gap-2">
                  {typeLabel && (
                    <span className="inline-flex items-center rounded-full bg-sky-100 px-2 py-0.5 text-[9px] font-medium text-sky-700">
                      {typeLabel}
                    </span>
                  )}
                  {confidencePercent !== null && (
                    <span className="text-[9px] text-slate-400">
                      Confidence: {confidencePercent}%
                    </span>
                  )}
                </div>
                {"summary" in analysis.extractedData! &&
                  (analysis.extractedData as { summary?: unknown }).summary && (
                    <p className="mb-1 text-[10px] text-slate-700">
                      {
                        (analysis.extractedData as {
                          summary?: string;
                        }).summary
                      }
                    </p>
                  )}
              </>
            )}
            {!loadingAnalysis && !analysisError && !analysis && (
              <p className="text-slate-400">
                No AI summary available yet for this email.
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
