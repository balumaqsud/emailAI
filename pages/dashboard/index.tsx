import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { RequireAuth } from "@/src/lib/auth/routeGuard";
import { useAuth } from "@/src/lib/auth/context";
import { AppLayout } from "@/components/layout/AppLayout";
import { MailList } from "@/components/mail/MailList";
import { listMailbox, markRead } from "@/src/lib/mail/api";
import type { MailboxItemSummary, MailFolder } from "@/src/lib/mail/types";
import styles from "@/styles/Mail.module.css";

export default function DashboardPage() {
  const router = useRouter();
  const { accessToken, signOut } = useAuth();

  const [items, setItems] = useState<MailboxItemSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const folderParam = router.query.folder;
  const folder: MailFolder =
    typeof folderParam === "string" ? (folderParam as MailFolder) : "inbox";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await listMailbox({ folder, limit: 20 }, accessToken);
        if (!cancelled) {
          setItems(data.items);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Failed to load inbox.";
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [accessToken, folder]);

  const handleLogout = () => {
    signOut();
    void router.push("/");
  };

  const handleCompose = () => {
    void router.push("/app/compose");
  };

  const handleSelectFolder = (nextFolder: MailFolder) => {
    void router.push(
      {
        pathname: "/dashboard",
        query: nextFolder === "inbox" ? {} : { folder: nextFolder },
      },
      undefined,
      { shallow: true },
    );
  };

  const unreadCount = items.filter((m) => !m.isRead).length;
  const isInbox = folder === "inbox";

  const handleOpenItem = (item: MailboxItemSummary) => {
    // Optimistically mark message as read in local state
    setItems((prev) =>
      prev.map((m) =>
        m.messageId === item.messageId ? { ...m, isRead: true } : m,
      ),
    );

    if (accessToken) {
      void markRead(item.messageId, true, accessToken).catch(() => {
        // keep UI optimistic; errors are handled server-side/logged
      });
    }

    void router.push(`/inbox/${item.messageId}`);
  };

  return (
    <RequireAuth>
      <AppLayout
        onLogout={handleLogout}
        onCompose={handleCompose}
        currentFolder={folder}
        onSelectFolder={handleSelectFolder}
      >
        <div className="flex items-center justify-between gap-2 rounded-2xl bg-white/80 px-3 py-2 text-xs shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="rounded-lg bg-slate-100 px-2 py-1 font-medium text-slate-700">
              {isInbox ? "Inbox" : "Sent"}
            </span>
            <span>
              {isInbox ? `${unreadCount} Unread` : `${items.length} Sent`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Sort by</span>
            <span className="rounded-lg bg-slate-50 px-2 py-1 text-slate-600">
              Recent
            </span>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {loading ? (
          <div className={styles.emptyState}>Loading inbox…</div>
        ) : (
          <MailList
            className="flex-1 overflow-y-auto pr-1"
            items={items}
            onItemClick={handleOpenItem}
          />
        )}
      </AppLayout>
    </RequireAuth>
  );
}
