import type { HTMLAttributes } from "react";
import { Badge } from "../ui/Badge";
import { Labels } from "./Labels";

export interface MailListItemProps extends HTMLAttributes<HTMLDivElement> {
  from: string;
  subject: string;
  preview: string;
  time: string;
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
  meta,
  labels = [],
  tag = "None",
  unread = false,
  className = "",
  ...props
}: MailListItemProps) {
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
          <p className="whitespace-nowrap text-[10px] text-slate-400">
            {time}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[11px] font-semibold text-slate-900">
            {subject}
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
        <p className="truncate text-[11px] text-slate-500">{preview}</p>
        <div className="flex items-center justify-between gap-2">
          {meta && (
            <p className="truncate text-[10px] text-slate-400">{meta}</p>
          )}
          {labels.length > 0 && <Labels labels={labels} />}
        </div>
      </div>
    </article>
  );
}

