import { useRouter } from "next/router";
import { RequireAuth } from "@/src/lib/auth/routeGuard";
import { useAuth } from "@/src/lib/auth/context";
import { AppLayout } from "@/components/layout/AppLayout";
import { MailList } from "@/components/mail/MailList";

export default function DashboardPage() {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleLogout = () => {
    signOut();
    void router.push("/");
  };

  return (
    <RequireAuth>
      <AppLayout onLogout={handleLogout}>
        <div className="flex items-center justify-between gap-2 rounded-2xl bg-white/80 px-3 py-2 text-xs shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="rounded-lg bg-slate-100 px-2 py-1 font-medium text-slate-700">
              Inbox
            </span>
            <span>24 Unread</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Sort by</span>
            <span className="rounded-lg bg-slate-50 px-2 py-1 text-slate-600">
              Recent
            </span>
          </div>
        </div>

        <MailList className="flex-1 overflow-y-auto pr-1" />
      </AppLayout>
    </RequireAuth>
  );
}

