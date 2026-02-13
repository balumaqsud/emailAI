import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/src/lib/auth/context";
import styles from "@/styles/Auth.module.css";

type ApiSuccess = {
  ok: true;
  gmailEmail: string;
};

type ApiErrorShape = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

export default function GmailCallbackPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      const code = router.query.code;
      if (!code || typeof code !== "string") {
        setError("Missing authorization code from Gmail.");
        return;
      }
      if (!accessToken) {
        setError("You must be signed in to connect Gmail.");
        return;
      }

      try {
        const params = new URLSearchParams({ code });
        const res = await fetch(`/api/auth/gmail/callback?${params.toString()}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
        });

        let data: ApiSuccess | ApiErrorShape;
        try {
          data = (await res.json()) as ApiSuccess | ApiErrorShape;
        } catch {
          throw new Error("Unexpected server response.");
        }

        if (!("ok" in data)) {
          throw new Error("Malformed server response.");
        }

        if (!data.ok) {
          const message =
            data.error?.message ?? "Failed to connect your Gmail account.";
          throw new Error(message);
        }

        await router.replace("/dashboard");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to connect your Gmail.";
        setError(message);
      }
    }

    if (router.isReady) {
      void handleCallback();
    }
  }, [router, accessToken]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Connecting your Gmail…</h1>
        <p className={styles.subtitle}>
          We&apos;re securely linking your Gmail inbox to this app.
        </p>
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

