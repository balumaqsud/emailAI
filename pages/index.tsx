import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuth } from "@/src/lib/auth/context";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || !user) return;
    void router.replace("/dashboard");
  }, [loading, user, router]);

  if (loading) {
    // Do not render anything while auth state is being resolved
    return null;
  }

  if (user) {
    // Redirect in progress; avoid flashing public content
    return null;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        background: "#f3f4f6",
      }}
    >
      <section
        style={{
          maxWidth: "640px",
          width: "100%",
          background: "#ffffff",
          borderRadius: "0.75rem",
          boxShadow: "0 10px 25px rgba(15, 23, 42, 0.12)",
          padding: "2.5rem 2.75rem",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "1.9rem",
            fontWeight: 600,
            marginBottom: "0.5rem",
          }}
        >
          Email App
        </h1>
        <p
          style={{
            fontSize: "0.98rem",
            color: "#6b7280",
            marginBottom: "1.75rem",
          }}
        >
          A simple internal email-style workspace for your team. Sign in to
          access your messages and conversations.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/auth/login"
            style={{
              padding: "0.7rem 1.2rem",
              borderRadius: "0.5rem",
              border: "1px solid #2563eb",
              background: "#2563eb",
              color: "#ffffff",
              fontSize: "0.95rem",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            style={{
              padding: "0.7rem 1.2rem",
              borderRadius: "0.5rem",
              border: "1px solid #d1d5db",
              background: "#ffffff",
              color: "#111827",
              fontSize: "0.95rem",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Sign Up
          </Link>
        </div>
      </section>
    </main>
  );
}
