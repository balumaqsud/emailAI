import type { HTMLAttributes } from "react";
import { MailListItem } from "./MailListItem";

const SAMPLE_MAILS = [
  {
    from: "Zoom",
    subject: "Recording Ready - Marketing Sync",
    preview:
      "AI extracted: Call summary – Need the latest report update prepared and schedule a follow-up...",
    time: "5 minutes ago",
    meta: "AI extracted • Today at 3:00 PM",
    tag: "Meeting" as const,
    unread: true,
  },
  {
    from: "Sarah Smith",
    subject: "Conf Call Follow-up",
    preview:
      "AI extracted: Call summary – Need the latest report update prepared and schedule a follow-up...",
    time: "9:45am",
    meta: "AI extracted • +1 555-123-4567",
    tag: "Important" as const,
    unread: true,
  },
  {
    from: "Amazon",
    subject: "Order #4053123678 Confirmed!",
    preview: "3 items • Total ₹2,750 • Expected delivery by 7 Mar",
    time: "Yesterday",
    meta: "Shopping • Advans",
    tag: "Shopping" as const,
    unread: false,
  },
  {
    from: "Newsletter",
    subject: "Top AI Productivity Tools for 2024",
    preview: "AI productivity tools that can boost your workflow...",
    time: "Yesterday",
    meta: "",
    tag: "Work" as const,
  },
  {
    from: "PayPal",
    subject: "Payment Received - Invoice #01762",
    preview: "₹15,300 credited from Yassmin Kumar",
    time: "Thursday",
    meta: "Finance",
    tag: "Finance" as const,
  },
];

export interface MailListProps extends HTMLAttributes<HTMLDivElement> {}

export function MailList({ className = "", ...props }: MailListProps) {
  return (
    <div className={["space-y-2", className].filter(Boolean).join(" ")} {...props}>
      {SAMPLE_MAILS.map((mail) => (
        <MailListItem key={mail.subject} {...mail} />
      ))}
    </div>
  );
}

