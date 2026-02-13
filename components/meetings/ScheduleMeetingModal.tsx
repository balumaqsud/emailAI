import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { MeetingListItem } from "@/src/features/meetings/types";

export interface ScheduleMeetingModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    title: string;
    meetUrl: string;
    startAt: string;
    endAt: string;
    timezone?: string;
    attendeeEmails?: string[];
  }) => Promise<MeetingListItem>;
  onSuccess?: () => void;
}

export function ScheduleMeetingModal({
  open,
  onClose,
  onSubmit,
  onSuccess,
}: ScheduleMeetingModalProps) {
  const [title, setTitle] = useState("");
  const [meetUrl, setMeetUrl] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [attendees, setAttendees] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    const url = meetUrl.trim();
    if (!url || !url.startsWith("https://")) {
      setError("A valid meeting URL is required (e.g. from Google Meet, Zoom, or Teams).");
      return;
    }
    if (!startAt || !endAt) {
      setError("Start and end time are required.");
      return;
    }
    const start = new Date(startAt);
    const end = new Date(endAt);
    if (end <= start) {
      setError("End time must be after start time.");
      return;
    }
    setSubmitting(true);
    try {
      const emails = attendees
        .split(/[\s,;]+/)
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
      await onSubmit({
        title: title.trim(),
        meetUrl: url,
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        timezone: tz,
        attendeeEmails: emails.length > 0 ? emails : undefined,
      });
      setTitle("");
      setMeetUrl("");
      setStartAt("");
      setEndAt("");
      setAttendees("");
      onClose();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to schedule meeting.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} title="Schedule meeting" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Meeting title"
          required
        />
        <Input
          label="Meeting URL"
          value={meetUrl}
          onChange={(e) => setMeetUrl(e.target.value)}
          placeholder="https://meet.google.com/xxx or Zoom/Teams link"
          required
        />
        <p className="text-[11px] text-slate-500">
          Create a meeting in Google Meet, Zoom, or Teams and paste the join
          link here.
        </p>
        <Input
          label="Start"
          type="datetime-local"
          value={startAt}
          onChange={(e) => setStartAt(e.target.value)}
          required
        />
        <Input
          label="End"
          type="datetime-local"
          value={endAt}
          onChange={(e) => setEndAt(e.target.value)}
          required
        />
        <Input
          label="Attendees (comma separated)"
          value={attendees}
          onChange={(e) => setAttendees(e.target.value)}
          placeholder="email1@example.com, email2@example.com"
        />
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Scheduling…" : "Schedule"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
