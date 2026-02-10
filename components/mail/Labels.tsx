import type { HTMLAttributes } from "react";

export interface LabelsProps extends HTMLAttributes<HTMLDivElement> {
  labels: string[];
}

export function Labels({ labels, className = "", ...props }: LabelsProps) {
  return (
    <div
      className={["flex flex-wrap items-center gap-1 text-[10px]", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {labels.map((label) => (
        <span
          key={label}
          className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-500"
        >
          {label}
        </span>
      ))}
    </div>
  );
}

