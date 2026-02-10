import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { SidebarItem } from "./SidebarItem";
import { SidebarSection } from "./SidebarSection";

export interface SidebarProps {
  children?: ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  const router = useRouter();
  const isDashboard = router.pathname === "/dashboard";

  return (
    <aside className="flex w-60 flex-col gap-4 rounded-3xl bg-slate-50/80 text-slate-800 px-3 py-4 text-xs ring-1 ring-slate-100">
      <header className="mb-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-sky-100 text-[11px] font-semibold text-sky-600">
            S
          </div>
          <div className="leading-tight">
            <p className="text-[13px] font-semibold text-slate-900">SignMail</p>
            <p className="text-[11px] text-slate-400">AI Email workspace</p>
          </div>
        </div>
      </header>

      <SidebarSection>
        <Link href="/dashboard">
          <SidebarItem label="Dashboard" active={isDashboard} />
        </Link>
      </SidebarSection>

      <SidebarSection title="Mail">
        <Link href="/dashboard">
          <SidebarItem label="Inbox" active={isDashboard} />
        </Link>
      </SidebarSection>

      {children}
    </aside>
  );
}
