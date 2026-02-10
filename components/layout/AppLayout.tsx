import type { ReactNode } from "react";
import { Sidebar } from "../navigation/Sidebar";
import { PageContainer } from "./PageContainer";
import { Topbar } from "../header/Topbar";
import { InsightsPanel } from "../dashboard/InsightsPanel";
import styles from "@/styles/AppLayout.module.css";

export interface AppLayoutProps {
  children: ReactNode;
  onLogout?: () => void;
  onCompose?: () => void;
}

export function AppLayout({
  children,
  onLogout,
  onCompose,
}: AppLayoutProps) {
  return (
    <div className={styles.root}>
      <PageContainer>
        <Sidebar />
        <main className={styles.main}>
          <Topbar onLogout={onLogout} onCompose={onCompose} />
          <div className={styles.mainInner}>
            <section className={styles.primaryColumn}>{children}</section>
            <aside className={`${styles.secondaryColumn} hidden md:block`}>
              <InsightsPanel />
            </aside>
          </div>
        </main>
      </PageContainer>
    </div>
  );
}


