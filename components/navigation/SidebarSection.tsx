import type { HTMLAttributes, ReactNode } from "react";

export interface SidebarSectionProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: ReactNode;
}

export function SidebarSection({
  title,
  children,
  className = "",
  ...props
}: SidebarSectionProps) {
  return (
    <section
      className={["space-y-2 text-xs text-slate-500", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {title && (
        <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {title}
        </p>
      )}
      <div className="space-y-1">{children}</div>
    </section>
  );
}

