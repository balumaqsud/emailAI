import type { HTMLAttributes, ReactNode } from "react";

export interface SidebarItemProps extends HTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  label: string;
  badge?: ReactNode;
  active?: boolean;
}

export function SidebarItem({
  icon,
  label,
  badge,
  active = false,
  className = "",
  ...props
}: SidebarItemProps) {
  const base =
    "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors";
  const state = active
    ? "bg-sky-100 text-slate-900 shadow-sm"
    : "text-slate-700 hover:bg-slate-50";

  return (
    <button
      type="button"
      className={[base, state, className].filter(Boolean).join(" ")}
      {...props}
    >
      <span className="flex items-center gap-2">
        {icon && (
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
            {icon}
          </span>
        )}
        <span>{label}</span>
      </span>
      {badge && <span>{badge}</span>}
    </button>
  );
}
