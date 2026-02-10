import { useRouter } from "next/router";
import { RequireAuth } from "@/src/lib/auth/routeGuard";
import { useAuth } from "@/src/lib/auth/context";

export default function InboxPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    void router.push("/auth/login");
  };

  return (
    <RequireAuth>
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f3f4f6",
          padding: "1.5rem",
        }}
      >
        <section
          style={{
            background: "#ffffff",
            borderRadius: "0.75rem",
            boxShadow: "0 10px 25px rgba(15, 23, 42, 0.12)",
            padding: "2rem 2.5rem",
            maxWidth: "640px",
            width: "100%",
          }}
        >
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 600,
              marginBottom: "0.5rem",
            }}
          >
            Welcome, {user?.nickname ?? "there"}
          </h1>
          <p
            style={{
              color: "#6b7280",
              marginBottom: "1.5rem",
            }}
          >
            This is your inbox placeholder. Email functionality will appear here
            later.
          </p>

          <button
            type="button"
            onClick={handleSignOut}
            style={{
              borderRadius: "0.5rem",
              border: "1px solid #d1d5db",
              padding: "0.6rem 0.9rem",
              fontSize: "0.95rem",
              fontWeight: 500,
              background: "#ffffff",
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </section>
      </main>
    </RequireAuth>
  );
}

