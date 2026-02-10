import { ReactNode, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "./context";

type RequireAuthProps = {
  children: ReactNode;
};

export function RequireAuth({ children }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      void router.replace("/auth/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    // Redirecting
    return null;
  }

  return <>{children}</>;
}

