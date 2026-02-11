import { useRouter } from "next/router";
import Link from "next/link";
import { RequireAuth } from "@/src/lib/auth/routeGuard";
import { useAuth } from "@/src/lib/auth/context";
import { AppLayout } from "@/components/layout/AppLayout";
import { useDashboardOverview } from "@/src/features/dashboard/useDashboardOverview";
import { AiPipelineCard } from "@/components/dashboard/AiPipelineCard";
import { NeedsReviewTable } from "@/components/dashboard/NeedsReviewTable";

export default function InboxPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const { data: overview, isLoading: overviewLoading } =
    useDashboardOverview("7d");

  const handleLogout = () => {
    signOut();
    void router.push("/");
  };

  const handleCompose = () => {
    void router.push("/app/compose");
  };

  const handleNeedsReviewMessageClick = (messageId: string) => {
    void router.push(`/inbox/${messageId}`);
  };

  return (
    <RequireAuth>
      <AppLayout onLogout={handleLogout} onCompose={handleCompose}>
        <div className="flex flex-col gap-4 md:flex-row">
          <section className="min-w-0 flex-1">
            <div className="rounded-2xl bg-white/90 p-6 shadow-sm ring-1 ring-slate-100">
              <h1 className="text-xl font-semibold text-slate-800">
                Welcome, {user?.nickname ?? "there"}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Your inbox home. Open the dashboard to see all mail with AI
                insights.
              </p>
              <Link
                href="/dashboard"
                className="mt-4 inline-block rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
              >
                Go to Dashboard
              </Link>
            </div>
          </section>

          <aside className="flex w-full flex-col gap-3 md:w-80 md:shrink-0">
            {overviewLoading && (
              <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />
            )}
            {overview && !overviewLoading && (
              <>
                <AiPipelineCard pipeline={overview.pipeline} />
                <NeedsReviewTable
                  items={overview.needsReview.slice(0, 5)}
                  onMessageClick={handleNeedsReviewMessageClick}
                />
              </>
            )}
          </aside>
        </div>
      </AppLayout>
    </RequireAuth>
  );
}
