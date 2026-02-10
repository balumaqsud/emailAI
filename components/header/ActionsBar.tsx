import { Button } from "../ui/Button";

export function ActionsBar() {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-500">
      <Button size="sm" variant="secondary" className="rounded-2xl px-3">
        Compose
      </Button>
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-100 hover:bg-slate-50"
      >
        ⬇
      </button>
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-100 hover:bg-slate-50"
      >
        ☰
      </button>
    </div>
  );
}

