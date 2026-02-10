import type { HTMLAttributes } from "react";
import { MailListItem } from "./MailListItem";
import type { MailboxItemSummary } from "@/src/lib/mail/types";
import styles from "@/styles/Mail.module.css";

export interface MailListProps extends HTMLAttributes<HTMLDivElement> {
  items: MailboxItemSummary[];
}

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  day: "numeric",
});

export function MailList({
  items,
  className = "",
  ...props
}: MailListProps) {
  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        Your inbox is empty. Messages you receive will appear here.
      </div>
    );
  }

  return (
    <div
      className={[styles.list, className].filter(Boolean).join(" ")}
      {...props}
    >
      {items.map((item) => {
        const createdAt = new Date(item.message.createdAt);
        const time = timeFormatter.format(createdAt);
        const subject = item.message.subject ?? "(no subject)";
        const preview = item.message.snippet;
        const from = item.message.senderId;

        return (
          <MailListItem
            key={item.mailboxId}
            from={from}
            subject={subject}
            preview={preview}
            time={time}
            unread={!item.isRead}
          />
        );
      })}
    </div>
  );
}

