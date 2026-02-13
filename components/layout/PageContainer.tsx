import type { HTMLAttributes } from "react";

export function PageContainer({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        "flex flex-1 min-h-0 w-full rounded-[32px] bg-slate-50/60 p-3",
        "shadow-[0_22px_60px_rgba(15,23,42,0.18)] ring-1 ring-slate-100",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

