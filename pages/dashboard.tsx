import { useRouter } from "next/router";
import { RequireAuth } from "@/src/lib/auth/routeGuard";
import { useAuth } from "@/src/lib/auth/context";

export default function DashboardPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    signOut();
    void router.push("/");
  };

  return (
    <RequireAuth>
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
          }}
        >
          <h1
            style={{
              fontSize: "1.9rem",
              fontWeight: 600,
              marginBottom: "0.5rem",
            }}
          >
            Welcome, {user?.nickname ?? "there"}
          </h1>
          <p
            style={{
              fontSize: "0.98rem",
              color: "#6b7280",
              marginBottom: "1.75rem",
            }}
          >
            You are logged in. This is your dashboard placeholder; more
            features will appear here soon.
          </p>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: "0.7rem 1.2rem",
              borderRadius: "0.5rem",
              border: "1px solid #d1d5db",
              background: "#ffffff",
              color: "#111827",
              fontSize: "0.95rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Log out
          </button>
        </section>
      </main>
    </RequireAuth>
  );
}

