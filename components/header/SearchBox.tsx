import { Input } from "../ui/Input";

export function SearchBox() {
  return (
    <div className="relative w-full max-w-md">
      <Input
        placeholder="Search mail..."
        className="rounded-2xl bg-slate-50/80 pr-9 text-xs"
      />
      <span
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        aria-hidden
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </span>
    </div>
  );
}

