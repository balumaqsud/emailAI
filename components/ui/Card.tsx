import type { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  header?: ReactNode;
  footer?: ReactNode;
}

export function Card({
  header,
  footer,
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={[
        "rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-100 backdrop-blur",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {header && <div className="mb-3 flex items-center justify-between gap-2">{header}</div>}
      <div>{children}</div>
      {footer && <div className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">{footer}</div>}
    </div>
  );
}

