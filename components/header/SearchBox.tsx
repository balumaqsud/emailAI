import { Input } from "../ui/Input";

export function SearchBox() {
  return (
    <div className="w-full max-w-md">
      <Input
        placeholder="Search mail..."
        className="rounded-2xl bg-slate-50/80 text-xs"
      />
    </div>
  );
}

