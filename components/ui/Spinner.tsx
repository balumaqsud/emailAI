import type { HTMLAttributes } from "react";

export function Spinner({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        "h-4 w-4 animate-spin rounded-full border-[2px] border-sky-500 border-t-transparent",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

