import type { HTMLAttributes, ReactNode } from "react";
import { useState } from "react";

export interface DropdownProps extends HTMLAttributes<HTMLDivElement> {
  trigger: ReactNode;
  children: ReactNode;
}

export function Dropdown({ trigger, children, className = "", ...props }: DropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={["relative inline-block text-left", className].filter(Boolean).join(" ")}
      {...props}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-full bg-white/60 px-2 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-100 hover:bg-white"
      >
        {trigger}
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-1 w-40 rounded-xl bg-white py-1 text-xs shadow-lg ring-1 ring-slate-100">
          {children}
        </div>
      )}
    </div>
  );
}

