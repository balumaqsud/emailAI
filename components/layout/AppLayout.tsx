import type { ReactNode } from "react";
import { Sidebar } from "../navigation/Sidebar";
import { PageContainer } from "./PageContainer";
import { Topbar } from "../header/Topbar";
import styles from "@/styles/AppLayout.module.css";
import type { MailFolder } from "@/src/lib/mail/types";

export interface AppLayoutProps {
  children: ReactNode;
  onLogout?: () => void;
  onCompose?: () => void;
  currentFolder?: MailFolder;
  onSelectFolder?: (folder: MailFolder) => void;
}

export function AppLayout({
  children,
  onLogout,
  onCompose,
  currentFolder,
  onSelectFolder,
}: AppLayoutProps) {
  return (
    <div className={styles.root}>
      <PageContainer>
        <Sidebar currentFolder={currentFolder} onSelectFolder={onSelectFolder} />
        <main className={styles.main}>
          <Topbar onLogout={onLogout} onCompose={onCompose} />
          <div className={styles.mainInner}>
            <section className={styles.primaryColumn}>{children}</section>
          </div>
        </main>
      </PageContainer>
    </div>
  );
}


