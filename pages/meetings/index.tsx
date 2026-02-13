import { useState } from "react";
import { useRouter } from "next/router";
import { RequireAuth } from "@/src/lib/auth/routeGuard";
import { useAuth } from "@/src/lib/auth/context";
import { AppLayout } from "@/components/layout/AppLayout";
import { ScheduleMeetingModal } from "@/components/meetings/ScheduleMeetingModal";
import { MeetingsTable } from "@/components/meetings/MeetingsTable";
import { useMeetings } from "@/src/features/meetings/useMeetings";
import { scheduleMeeting } from "@/src/features/meetings/meetingsClient";
import type { MailFolder } from "@/src/lib/mail/types";

export default function MeetingsPage() {
  const router = useRouter();
  const { accessToken, signOut } = useAuth();
  const { data, isLoading, error, mutate } = useMeetings({ limit: 50 });

  const [modalOpen, setModalOpen] = useState(false);
  const [finalizingId, setFinalizingId] = useState<string | null>(null);

  const handleLogout = () => {
    signOut();
    void router.push("/");
  };

  const handleCompose = () => {
    void router.push("/app/compose");
  };

  const handleSelectFolder = (folder: MailFolder) => {
    void router.push({
      pathname: "/dashboard",
      query: folder === "inbox" ? {} : { folder },
    });
  };

  const handleSchedule = async (payload: {
    title: string;
    meetUrl: string;
    startAt: string;
    endAt: string;
    timezone?: string;
    attendeeEmails?: string[];
  }) => {
    if (!accessToken) throw new Error("Not authenticated");
    return scheduleMeeting(accessToken, payload);
  };

  const handleFinalize = async (meeting: { id: string }) => {
    if (!accessToken) return;
    setFinalizingId(meeting.id);
    try {
      const { finalizeMeeting } = await import(
        "@/src/features/meetings/meetingsClient"
      );
      await finalizeMeeting(accessToken, meeting.id);
      await mutate();
    } catch {
      setFinalizingId(null);
    } finally {
      setFinalizingId(null);
    }
  };

  return (
    <RequireAuth>
      <AppLayout
        onLogout={handleLogout}
        onCompose={handleCompose}
        onSelectFolder={handleSelectFolder}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-xl font-semibold text-slate-800">Meetings</h1>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
            >
              Schedule meeting
            </button>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
              {error.message}
            </div>
          )}

          {isLoading ? (
            <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />
          ) : (
            <MeetingsTable
              items={data?.items ?? []}
              onFinalize={handleFinalize}
              finalizingId={finalizingId}
            />
          )}
        </div>
      </AppLayout>

      <ScheduleMeetingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSchedule}
        onSuccess={() => void mutate()}
      />
    </RequireAuth>
  );
}
