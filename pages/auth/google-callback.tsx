import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/src/lib/auth/context";
import styles from "@/styles/Auth.module.css";

type ApiSuccess = {
  ok: true;
  user: {
    id: string;
    nickname: string;
    email?: string;
  };
  accessToken: string;
};

type ApiErrorShape = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

export default function GoogleCallbackPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleGoogleCallback() {
      const code = router.query.code;
      if (!code || typeof code !== "string") {
        setError("Missing authorization code from Google.");
        return;
      }

      try {
        const params = new URLSearchParams({ code });
        const res = await fetch(`/api/auth/google/callback?${params.toString()}`, {
          method: "GET",
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
          const message = data.error?.message ?? "Failed to sign in with Google.";
          throw new Error(message);
        }

        signIn({
          user: data.user,
          accessToken: data.accessToken,
        });

        await router.replace("/dashboard");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to sign in with Google.";
        setError(message);
      }
    }

    if (router.isReady) {
      void handleGoogleCallback();
    }
  }, [router, signIn]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Signing you in…</h1>
        <p className={styles.subtitle}>
          Completing sign-in with your Google account.
        </p>
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

