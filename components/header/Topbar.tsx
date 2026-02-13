import { ActionsBar } from "./ActionsBar";
import { SearchBox } from "./SearchBox";
import { UserMenu } from "./UserMenu";

export interface TopbarProps {
  onLogout?: () => void;
  onCompose?: () => void;
}

export function Topbar({ onLogout, onCompose }: TopbarProps) {
  return (
    <header className="flex items-center justify-between gap-4 rounded-2xl bg-white/80 px-4 py-3 text-xs shadow-sm ring-1 ring-slate-100">
      <div className="flex flex-1 items-center gap-3">
        <SearchBox />
      </div>
      <div className="flex items-center gap-3">
        <ActionsBar onCompose={onCompose} />
        <UserMenu onLogout={onLogout} />
      </div>
    </header>
  );
}

