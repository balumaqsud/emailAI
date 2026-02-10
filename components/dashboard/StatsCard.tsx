import type { HTMLAttributes, ReactNode } from "react";

export interface StatsCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  className = "",
  ...props
}: StatsCardProps) {
  return (
    <div
      className={[
        "flex items-center justify-between gap-3 rounded-2xl bg-white/80 px-3 py-2.5 text-xs shadow-sm ring-1 ring-slate-100",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <div>
        <p className="text-[11px] font-medium text-slate-500">{title}</p>
        <p className="text-sm font-semibold text-slate-900">{value}</p>
        {subtitle && (
          <p className="text-[10px] text-slate-400">{subtitle}</p>
        )}
      </div>
      {icon && (
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
          {icon}
        </div>
      )}
    </div>
  );
}

