import type { ReactNode } from "react";
import { SidebarItem } from "./SidebarItem";
import { SidebarSection } from "./SidebarSection";
import { Badge } from "../ui/Badge";

export interface SidebarProps {
  children?: ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
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
        <SidebarItem label="Dashboard" active />
      </SidebarSection>

      <SidebarSection title="Mail">
        <SidebarItem
          label="Inbox"
          badge={
            <Badge variant="info" className="px-2 py-0 text-[10px]">
              24
            </Badge>
          }
        />
        <SidebarItem label="Sent" />
        <SidebarItem
          label="Drafts"
          badge={
            <Badge variant="warning" className="px-2 py-0 text-[10px]">
              5
            </Badge>
          }
        />
        <SidebarItem label="Spam" />
        <SidebarItem label="Trash" />
      </SidebarSection>

      <SidebarSection title="Help">
        <SidebarItem label="Setting" />
        <SidebarItem label="Support" />
      </SidebarSection>

      <div className="mt-auto">
        <div className="rounded-2xl bg-sky-50 px-3 py-3 text-[11px] text-slate-800 ring-1 ring-sky-100">
          <p className="mb-1 font-semibold text-slate-900">AI Email Assistant</p>
          <p className="mb-3 text-[10px] text-slate-500">
            Ask your AI assistant to fetch any email details or insights.
          </p>
          <div className="rounded-xl bg-white px-2 py-1 text-[10px] text-slate-500 ring-1 ring-slate-100">
            What can I assist you with?
          </div>
        </div>
      </div>

      {children}
    </aside>
  );
}
