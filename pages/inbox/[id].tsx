import { useRouter } from "next/router";
import { RequireAuth } from "@/src/lib/auth/routeGuard";

export default function InboxThreadPage() {
  const router = useRouter();
  const { id } = router.query;

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
              fontSize: "1.5rem",
              fontWeight: 600,
              marginBottom: "0.75rem",
            }}
          >
            Thread {id}
          </h1>
          <p
            style={{
              color: "#6b7280",
            }}
          >
            This is a placeholder for the email thread view. You&apos;ll see the
            full conversation for this message here in the future.
          </p>
        </section>
      </main>
    </RequireAuth>
  );
}

