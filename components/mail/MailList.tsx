import { useState, type HTMLAttributes } from "react";
import { MailListItem } from "./MailListItem";
import { InboxAiRow } from "@/components/inbox/InboxAiRow";
import { InboxAiDetailsModal } from "@/components/inbox/InboxAiDetailsModal";
import type { MailboxItemSummary } from "@/src/lib/mail/types";
import type { EmailAnalysis } from "@/src/lib/mail/types";
import type { EmailType } from "@/src/features/dashboard/types";
import { useAuth } from "@/src/lib/auth/context";
import { getEmailAiDetails, type EmailAiDetails } from "@/src/lib/mail/api";
import styles from "@/styles/Mail.module.css";

const VALID_EMAIL_TYPES: EmailType[] = [
  "invoice",
  "meeting",
  "support",
  "job_application",
  "general",
];

function toEmailType(s: string): EmailType {
  return VALID_EMAIL_TYPES.includes(s as EmailType) ? (s as EmailType) : "general";
}

export interface MailListProps extends HTMLAttributes<HTMLDivElement> {
  items: MailboxItemSummary[];
  onItemClick?: (item: MailboxItemSummary) => void;
  /** When provided, rows render as InboxAiRow with classification/extraction. */
  aiMap?: Record<string, EmailAnalysis | null>;
}

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  day: "numeric",
});

export function MailList({
  items,
  onItemClick,
  aiMap,
  className = "",
  ...props
}: MailListProps) {
  const { accessToken } = useAuth();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [details, setDetails] = useState<EmailAiDetails | null>(null);

  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        Your inbox is empty. Messages you receive will appear here.
      </div>
    );
  }

  const useAi = aiMap && Object.keys(aiMap).length > 0;

  async function handleShowDetails(messageId: string): Promise<void> {
    if (!accessToken) {
      setDetailsError("You must be logged in to view AI details.");
      setDetailsOpen(true);
      return;
    }
    setDetailsOpen(true);
    setDetailsLoading(true);
    setDetailsError(null);
    setDetails(null);
    try {
      const data = await getEmailAiDetails(messageId, accessToken);
      setDetails(data);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to load AI details.";
      setDetailsError(msg);
    } finally {
      setDetailsLoading(false);
    }
  }

  return (
    <>
      <div
        className={[styles.list, className].filter(Boolean).join(" ")}
        {...props}
      >
        {items.map((item) => {
        const createdAt = new Date(item.message.createdAt);
        const time = timeFormatter.format(createdAt);
        const subject = item.message.subject ?? "(no subject)";
        const from = item.message.senderNickname ?? item.message.senderId;
        const analysis = useAi ? aiMap[item.messageId] : undefined;

        if (useAi) {
          const type = analysis ? toEmailType(analysis.type) : "general";
          return (
            <InboxAiRow
              key={item.mailboxId}
              subject={subject}
              from={from}
              date={time}
              messageId={item.messageId}
              unread={!item.isRead}
              onClick={() => onItemClick?.(item)}
              onShowDetails={handleShowDetails}
              classification={
                analysis
                  ? { type, confidence: analysis.confidence }
                  : undefined
              }
              extraction={
                analysis
                  ? {
                      status: "done",
                      type,
                      confidence: analysis.confidence,
                      extractedData: analysis.extractedData ?? undefined,
                    }
                  : undefined
              }
            />
          );
        }

        const rawSnippet = item.message.snippet;
        const MAX_PREVIEW_LENGTH = 150;
        const preview =
          rawSnippet.length > MAX_PREVIEW_LENGTH
            ? `${rawSnippet.slice(0, MAX_PREVIEW_LENGTH).trimEnd()}…`
            : rawSnippet;
        return (
          <MailListItem
            key={item.mailboxId}
            from={from}
            subject={subject}
            preview={preview}
            time={time}
            messageId={item.messageId}
            unread={!item.isRead}
            onClick={() => onItemClick?.(item)}
          />
        );
      })}
      </div>
      <InboxAiDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        details={details}
        loading={detailsLoading}
        error={detailsError}
      />
    </>
  );
}
