import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { getGoogleAuthUrl, register } from "@/src/lib/auth/api";
import { useAuth } from "@/src/lib/auth/context";
import styles from "@/styles/Auth.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        nickname,
        password,
        email: email.trim() === "" ? undefined : email,
      };
      const result = await register(payload);
      signIn(result);
      await router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to sign up.";
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
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>
          Choose a username and password to get started.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="username">
              Username
            </label>
            <input
              id="username"
              className={styles.input}
              type="text"
              autoComplete="username"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email (optional)
            </label>
            <input
              id="email"
              className={styles.input}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.button} disabled={submitting}>
            {submitting ? "Creating account..." : "Sign up"}
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
          Already have an account?{" "}
          <Link href="/auth/login" className={styles.link}>
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
