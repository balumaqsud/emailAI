import type { ReactNode } from "react";

export interface ModalProps {
  open: boolean;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
}

export function Modal({ open, title, children, onClose }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between gap-4">
          {title && <h2 className="text-sm font-semibold text-slate-900">{title}</h2>}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <span className="sr-only">Close</span>
              ×
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

