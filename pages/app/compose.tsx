import { useState } from "react";
import { useRouter } from "next/router";
import { RequireAuth } from "@/src/lib/auth/routeGuard";
import { useAuth } from "@/src/lib/auth/context";
import { sendMail } from "@/src/lib/mail/api";
import { ComposeForm } from "@/components/mail/ComposeForm";
import styles from "@/styles/Compose.module.css";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import type { MailFolder } from "@/src/lib/mail/types";

export default function ComposePage() {
  const router = useRouter();
  const { accessToken, signOut } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(input: Parameters<typeof sendMail>[0]) {
    if (!accessToken) {
      setError("You must be logged in to send mail.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await sendMail(input, accessToken);
      await router.push("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to send message.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

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
        <div className="mb-2 flex items-center justify-between gap-2 rounded-2xl bg-white/80 px-3 py-2 text-xs shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-xl px-3"
              onClick={handleBack}
            >
              ← Back
            </Button>
            <span className="text-[11px] text-slate-500">New message</span>
          </div>
        </div>
        <div className={styles.card}>
          <h1 className={styles.title}>New message</h1>
          <p className={styles.subtitle}>
            Send an internal message by nickname. Attachments and rich text
            will be added later.
          </p>
          <ComposeForm
            onSubmit={handleSubmit}
            submitting={submitting}
            error={error}
          />
        </div>
      </AppLayout>
    </RequireAuth>
  );
}

