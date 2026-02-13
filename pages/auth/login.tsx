import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { getGoogleAuthUrl, login } from "@/src/lib/auth/api";
import { useAuth } from "@/src/lib/auth/context";
import styles from "@/styles/Auth.module.css";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await login({ identifier, password });
      signIn(result);
      await router.push("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to log in.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setSubmitting(true);
    try {
      const url = await getGoogleAuthUrl();
      window.location.href = url;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to sign in with Google.";
      setError(message);
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Log in</h1>
        <p className={styles.subtitle}>
          Sign in with your username or email to access your inbox.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="identifier">
              Username or email
            </label>
            <input
              id="identifier"
              className={styles.input}
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className={styles.input}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className={styles.button}
            disabled={submitting}
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>

          <button
            type="button"
            className={styles.buttonSecondary}
            onClick={() => void handleGoogleSignIn()}
            disabled={submitting}
          >
            Continue with Google
          </button>

          {error && <p className={styles.error}>{error}</p>}
        </form>

        <div className={styles.footer}>
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className={styles.link}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

