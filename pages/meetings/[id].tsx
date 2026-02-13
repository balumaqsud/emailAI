import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { RequireAuth } from "@/src/lib/auth/routeGuard";
import { useAuth } from "@/src/lib/auth/context";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TranscriptFeed } from "@/components/meetings/TranscriptFeed";
import { MeetingSummaryCard } from "@/components/meetings/MeetingSummaryCard";
import { useMeetingDetail } from "@/src/features/meetings/useMeetingDetail";
import { useTranscriptFeed } from "@/src/features/meetings/useTranscriptFeed";
import { finalizeMeeting } from "@/src/features/meetings/meetingsClient";
import type { MailFolder } from "@/src/lib/mail/types";

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "full",
  timeStyle: "short",
});

function statusVariant(
  status: string,
): "default" | "warning" | "success" | "info" {
  switch (status) {
    case "completed":
      return "success";
    case "in_progress":
      return "info";
    case "failed":
      return "warning";
    default:
      return "default";
  }
}

export default function MeetingDetailPage() {
  const router = useRouter();
  const { accessToken, signOut } = useAuth();
  const id = typeof router.query.id === "string" ? router.query.id : null;

  const { data: meeting, isLoading, error, mutate } = useMeetingDetail(id);
  const { chunks, isLoading: transcriptLoading } = useTranscriptFeed(id);

  const [activeTab, setActiveTab] = useState<"transcript" | "summary">(
    "transcript",
  );
  const [finalizing, setFinalizing] = useState(false);

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

  const handleFinalize = async () => {
    if (!accessToken || !id) return;
    setFinalizing(true);
    try {
      await finalizeMeeting(accessToken, id);
      await mutate();
    } finally {
      setFinalizing(false);
    }
  };

  const canFinalize =
    meeting &&
    !meeting.artifact &&
    (meeting.status === "in_progress" ||
      meeting.status === "scheduled" ||
      meeting.status === "completed");

  if (!id) {
    return (
      <RequireAuth>
        <AppLayout
          onLogout={handleLogout}
          onCompose={handleCompose}
          onSelectFolder={handleSelectFolder}
        >
          <div className="p-4 text-sm text-slate-600">Meeting not found.</div>
        </AppLayout>
      </RequireAuth>
    );
  }

  if (isLoading && !meeting) {
    return (
      <RequireAuth>
        <AppLayout
          onLogout={handleLogout}
          onCompose={handleCompose}
          onSelectFolder={handleSelectFolder}
        >
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          </div>
        </AppLayout>
      </RequireAuth>
    );
  }

  if (error || !meeting) {
    return (
      <RequireAuth>
        <AppLayout
          onLogout={handleLogout}
          onCompose={handleCompose}
          onSelectFolder={handleSelectFolder}
        >
          <div className="p-4">
            <p className="text-sm text-red-600">
              {error?.message ?? "Meeting not found."}
            </p>
            <Link href="/meetings" className="mt-2 inline-block text-sky-600">
              Back to meetings
            </Link>
          </div>
        </AppLayout>
      </RequireAuth>
    );
  }

  const start = new Date(meeting.startAt);

  return (
    <RequireAuth>
      <AppLayout
        onLogout={handleLogout}
        onCompose={handleCompose}
        onSelectFolder={handleSelectFolder}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <Link
                href="/meetings"
                className="mb-2 inline-block text-xs text-slate-500 hover:text-sky-600"
              >
                ← Back to meetings
              </Link>
              <h1 className="text-xl font-semibold text-slate-800">
                {meeting.title}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {timeFormatter.format(start)}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant={statusVariant(meeting.status)}>
                  {meeting.status}
                </Badge>
                {meeting.meetUrl && (
                  <a
                    href={meeting.meetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-sky-600 hover:underline"
                  >
                    Open in Google Meet
                  </a>
                )}
              </div>
            </div>
            {canFinalize && (
              <Button
                size="sm"
                variant="secondary"
                onClick={handleFinalize}
                disabled={finalizing}
              >
                {finalizing ? "Finalizing…" : "Finalize"}
              </Button>
            )}
          </div>

          <div className="flex gap-2 border-b border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab("transcript")}
              className={`rounded-t-lg px-4 py-2 text-xs font-medium ${
                activeTab === "transcript"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Live Transcript
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("summary")}
              className={`rounded-t-lg px-4 py-2 text-xs font-medium ${
                activeTab === "summary"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Summary
            </button>
          </div>

          {activeTab === "transcript" && (
            <TranscriptFeed chunks={chunks} isLoading={transcriptLoading} />
          )}
          {activeTab === "summary" && <MeetingSummaryCard meeting={meeting} />}
        </div>
      </AppLayout>
    </RequireAuth>
  );
}
