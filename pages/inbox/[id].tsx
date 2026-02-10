import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { RequireAuth } from "@/src/lib/auth/routeGuard";
import { useAuth } from "@/src/lib/auth/context";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { getMessage, markRead } from "@/src/lib/mail/api";
import type { MailFolder, MailMessageDetail } from "@/src/lib/mail/types";
import styles from "@/styles/Mail.module.css";

export default function InboxThreadPage() {
  const router = useRouter();
  const { id } = router.query;
  const messageId = typeof id === "string" ? id : undefined;

  const { accessToken, signOut } = useAuth();

  const [message, setMessage] = useState<MailMessageDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!messageId || !accessToken) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getMessage(messageId, accessToken);
        if (!cancelled) {
          setMessage(data);
        }
        // Fire-and-forget read tracking; do not fail the view if this errors
        void markRead(messageId, true, accessToken).catch(() => {
          // no-op
        });
      } catch (err) {
        if (!cancelled) {
          const msg =
            err instanceof Error ? err.message : "Failed to load message.";
          setError(msg);
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
  }, [messageId, accessToken]);

  const handleLogout = () => {
    signOut();
    void router.push("/");
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      void router.push("/dashboard");
    }
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

  return (
    <RequireAuth>
      <AppLayout
        onLogout={handleLogout}
        currentFolder="inbox"
        onSelectFolder={handleSelectFolder}
      >
        <div className="flex items-center justify-between gap-2 rounded-2xl bg-white/80 px-3 py-2 text-xs shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-xl px-3"
              onClick={handleBack}
            >
              ← Back
            </Button>
            <span className="text-[11px] text-slate-500">
              {message
                ? (message.subject ?? "(no subject)")
                : messageId ?? ""}
            </span>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {loading || !message ? (
          <div className={styles.emptyState}>Loading message…</div>
        ) : (
          <article className="mt-3 space-y-3 rounded-2xl bg-white/90 p-4 text-xs shadow-sm ring-1 ring-slate-100">
            <header className="border-b border-slate-100 pb-3">
              <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Subject
              </p>
              <h1 className="text-sm font-semibold text-slate-900">
                {message.subject ?? "(no subject)"}
              </h1>
              <p className="mt-2 text-[11px] text-slate-500">
                From{" "}
                <span className="font-medium text-slate-800">
                  {message.senderNickname ?? message.senderId}
                </span>
              </p>
            </header>

            <section className="whitespace-pre-wrap text-[11px] leading-relaxed text-slate-800">
              {message.body.text}
            </section>
          </article>
        )}
      </AppLayout>
    </RequireAuth>
  );
}
