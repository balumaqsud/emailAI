import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { RequireAuth } from "@/src/lib/auth/routeGuard";
import { useAuth } from "@/src/lib/auth/context";
import { AppLayout } from "@/components/layout/AppLayout";
import { MailList } from "@/components/mail/MailList";
import { listMailbox, markRead, getEmailAnalysis } from "@/src/lib/mail/api";
import type {
  MailboxItemSummary,
  MailFolder,
  EmailAnalysis,
} from "@/src/lib/mail/types";
import type { DashboardRange } from "@/src/features/dashboard/types";
import { useDashboardOverview } from "@/src/features/dashboard/useDashboardOverview";
import { AiPipelineCard } from "@/components/dashboard/AiPipelineCard";
import { TypeDistributionChart } from "@/components/dashboard/TypeDistributionChart";
import { IdentifiedHighlights } from "@/components/dashboard/IdentifiedHighlights";
import { NeedsReviewTable } from "@/components/dashboard/NeedsReviewTable";
import styles from "@/styles/Mail.module.css";

export default function DashboardPage() {
  const router = useRouter();
  const { accessToken, signOut } = useAuth();

  const [range, setRange] = useState<DashboardRange>("7d");
  const [items, setItems] = useState<MailboxItemSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [aiMap, setAiMap] = useState<Record<string, EmailAnalysis>>({});

  const {
    data: overview,
    isLoading: overviewLoading,
    error: overviewError,
  } = useDashboardOverview(range);

  useEffect(() => {
    if (!accessToken || items.length === 0) return;

    const limit = 10;
    let cancelled = false;

    async function fetchAi() {
      const nextMap: Record<string, EmailAnalysis> = {};
      const toFetch = items.slice(0, limit).map((i) => i.messageId);

      await Promise.all(
        toFetch.map(async (messageId) => {
          if (cancelled) return;
          try {
            const analysis = await getEmailAnalysis(messageId, accessToken!);
            if (!cancelled) nextMap[messageId] = analysis;
          } catch {
            if (!cancelled) nextMap[messageId] = null;
          }
        }),
      );

      if (!cancelled) setAiMap((prev) => ({ ...prev, ...nextMap }));
    }

    void fetchAi();
    return () => {
      cancelled = true;
    };
  }, [accessToken, items]);

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
          setError(
            err instanceof Error ? err.message : "Failed to load inbox.",
          );
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
    setItems((prev) =>
      prev.map((m) =>
        m.messageId === item.messageId ? { ...m, isRead: true } : m,
      ),
    );
    if (accessToken) {
      void markRead(item.messageId, true, accessToken).catch(() => {});
    }
    void router.push(`/inbox/${item.messageId}`);
  };

  const handleNeedsReviewMessageClick = (messageId: string) => {
    void router.push(`/inbox/${messageId}`);
  };

  return (
    <RequireAuth>
      <AppLayout
        onLogout={handleLogout}
        onCompose={handleCompose}
        currentFolder={folder}
        onSelectFolder={handleSelectFolder}
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600">Range:</span>
            {(["24h", "7d", "30d"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                  range === r
                    ? "bg-sky-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {overviewError && (
          <div className={styles.error}>
            Dashboard overview failed: {overviewError.message}
          </div>
        )}

        {overviewLoading && !overview && (
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-2xl bg-slate-100"
              />
            ))}
          </div>
        )}

        {overview && !overviewLoading && (
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <AiPipelineCard pipeline={overview.pipeline} />
            <TypeDistributionChart distribution={overview.distribution} />
            <IdentifiedHighlights highlights={overview.highlights} />
          </div>
        )}

        {overview && !overviewLoading && (
          <div className="mb-4">
            <NeedsReviewTable
              items={overview.needsReview}
              onMessageClick={handleNeedsReviewMessageClick}
            />
          </div>
        )}

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
            aiMap={Object.keys(aiMap).length > 0 ? aiMap : undefined}
          />
        )}
      </AppLayout>
    </RequireAuth>
  );
}
