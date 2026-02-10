import type { HTMLAttributes } from "react";

type BadgeVariant = "default" | "warning" | "success" | "info";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700",
  warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  info: "bg-sky-50 text-sky-700 ring-1 ring-sky-100",
};

export function Badge({
  children,
  className = "",
  variant = "default",
  ...props
}: BadgeProps) {
  const classes = [
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium",
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}

