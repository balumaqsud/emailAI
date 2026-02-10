import type { HTMLAttributes } from "react";

export function PageContainer({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        "mx-auto flex h-screen max-h-[900px] max-w-6xl rounded-[32px] bg-slate-50/60 p-3",
        "shadow-[0_22px_60px_rgba(15,23,42,0.18)] ring-1 ring-slate-100",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

