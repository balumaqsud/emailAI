import type { ReactNode } from "react";
import { Sidebar } from "../navigation/Sidebar";
import { PageContainer } from "./PageContainer";
import { Topbar } from "../header/Topbar";
import { InsightsPanel } from "../dashboard/InsightsPanel";

export interface AppLayoutProps {
  children: ReactNode;
  onLogout?: () => void;
}

export function AppLayout({ children, onLogout }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[#e8f0ff] px-4 py-6">
      <PageContainer>
        <Sidebar />
        <main className="flex flex-1 flex-col gap-3 pl-3">
          <Topbar onLogout={onLogout} />
          <div className="flex flex-1 gap-3 overflow-hidden">
            <section className="flex min-w-0 flex-[1.7] flex-col gap-2">
              {children}
            </section>
            <aside className="hidden w-72 flex-shrink-0 md:block">
              <InsightsPanel />
            </aside>
          </div>
        </main>
      </PageContainer>
    </div>
  );
}


