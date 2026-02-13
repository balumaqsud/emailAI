import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { SidebarItem } from "./SidebarItem";
import { SidebarSection } from "./SidebarSection";
import type { MailFolder } from "@/src/lib/mail/types";

export interface SidebarProps {
  children?: ReactNode;
  currentFolder?: MailFolder;
  onSelectFolder?: (folder: MailFolder) => void;
}

export function Sidebar({
  children,
  currentFolder = "inbox",
  onSelectFolder,
}: SidebarProps) {
  const router = useRouter();
  const isDashboard = router.pathname === "/dashboard";
  const isMeetings =
    router.pathname === "/meetings" || router.pathname.startsWith("/meetings/");
  const isInbox = !isMeetings && currentFolder === "inbox";
  const isSent = !isMeetings && currentFolder === "sent";

  return (
    <aside className="flex w-60 flex-col gap-4 rounded-3xl bg-slate-50/80 text-slate-800 px-3 py-4 text-xs ring-1 ring-slate-100">
      <header className="mb-1 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-sky-100 text-[11px] font-semibold text-sky-600">
            S
          </div>
          <div className="leading-tight">
            <p className="text-[13px] font-semibold text-slate-900">
              Promtlab AI
            </p>
            <p className="text-[11px] text-slate-400">AI Email workspace</p>
          </div>
        </Link>
      </header>

      <SidebarSection>
        <Link href="/dashboard">
          <SidebarItem label="Dashboard" active={isDashboard} />
        </Link>
      </SidebarSection>

      <SidebarSection title="Mail">
        <button
          type="button"
          onClick={() => onSelectFolder?.("inbox")}
          className="w-full text-left"
        >
          <SidebarItem label="Inbox" active={isInbox} />
        </button>
        <button
          type="button"
          onClick={() => onSelectFolder?.("sent")}
          className="w-full text-left"
        >
          <SidebarItem label="Sent" active={isSent} />
        </button>
        <Link href="/meetings">
          <SidebarItem label="Meetings" active={isMeetings} />
        </Link>
      </SidebarSection>

      {children}
    </aside>
  );
}
