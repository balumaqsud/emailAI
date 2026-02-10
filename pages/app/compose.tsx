import { useRouter } from "next/router";
import { RequireAuth } from "@/src/lib/auth/routeGuard";
import { useAuth } from "@/src/lib/auth/context";
import { sendMail } from "@/src/lib/mail/api";
import { ComposeForm } from "@/components/mail/ComposeForm";
import styles from "@/styles/Compose.module.css";
import { AppLayout } from "@/components/layout/AppLayout";

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

  return (
    <RequireAuth>
      <AppLayout onLogout={handleLogout}>
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

