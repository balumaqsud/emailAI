import { useAuth } from "@/src/lib/auth/context";
import { Dropdown } from "../ui/Dropdown";

export interface UserMenuProps {
  onLogout?: () => void;
}

export function UserMenu({ onLogout }: UserMenuProps) {
  const { user } = useAuth();
  const initials = (user?.nickname ?? "S")[0]?.toUpperCase();

  return (
    <Dropdown
      trigger={
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
            {initials}
          </div>
          <div className="hidden text-left text-[11px] leading-tight text-slate-700 sm:block">
            <p className="font-semibold">{user?.nickname ?? "Sanket"}</p>
            <p className="text-[10px] text-slate-400">Online</p>
          </div>
        </div>
      }
    >
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-1.5 text-left text-[11px] text-slate-600 hover:bg-slate-50"
      >
        Profile
      </button>
      <button
        type="button"
        onClick={onLogout}
        className="flex w-full items-center justify-between px-3 py-1.5 text-left text-[11px] text-rose-600 hover:bg-rose-50"
      >
        Log out
      </button>
    </Dropdown>
  );
}

