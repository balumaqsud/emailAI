import {
  meetingDetailSchema,
  meetingListItemSchema,
  meetingsListDataSchema,
  transcriptChunkSchema,
} from "./schemas";
import type {
  MeetingDetail,
  MeetingListItem,
  MeetingsListResponse,
  TranscriptChunkDTO,
} from "./types";

function getBaseUrl(): string {
  if (typeof window !== "undefined") return "";
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function fetchWithAuth(url: string, accessToken: string, init?: RequestInit) {
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...init?.headers,
    },
  });
}

export async function fetchMeetings(
  accessToken: string,
  opts?: { limit?: number; cursor?: string },
): Promise<MeetingsListResponse> {
  const params = new URLSearchParams();
  if (opts?.limit != null) params.set("limit", String(opts.limit));
  if (opts?.cursor != null) params.set("cursor", opts.cursor);
  const qs = params.toString();
  const url = `${getBaseUrl()}/api/meetings${qs ? `?${qs}` : ""}`;
  const res = await fetchWithAuth(url, accessToken);

  if (!res.ok) {
    const body = await res.text();
    let message = "Failed to fetch meetings";
    try {
      const json = JSON.parse(body) as { error?: { message?: string } };
      if (json?.error?.message) message = json.error.message;
    } catch {
      if (body) message = body.slice(0, 200);
    }
    throw new Error(message);
  }

  const raw = await res.json();
  const data = raw?.data ?? raw;
  const parsed = meetingsListDataSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid meetings response");
  }
  return parsed.data;
}

export async function scheduleMeeting(
  accessToken: string,
  payload: {
    title: string;
    meetUrl: string;
    startAt: string;
    endAt: string;
    timezone?: string;
    attendeeEmails?: string[];
  },
): Promise<MeetingListItem> {
  const url = `${getBaseUrl()}/api/meetings`;
  const res = await fetchWithAuth(url, accessToken, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    let message = "Failed to schedule meeting";
    try {
      const json = JSON.parse(body) as { error?: { message?: string } };
      if (json?.error?.message) message = json.error.message;
    } catch {
      if (body) message = body.slice(0, 200);
    }
    throw new Error(message);
  }

  const raw = await res.json();
  const meeting = raw?.meeting ?? raw;
  const parsed = meetingListItemSchema.safeParse(meeting);
  if (!parsed.success) {
    throw new Error("Invalid schedule meeting response");
  }
  return parsed.data as MeetingListItem;
}

export async function fetchMeetingDetail(
  accessToken: string,
  meetingId: string,
): Promise<MeetingDetail> {
  const url = `${getBaseUrl()}/api/meetings/${encodeURIComponent(meetingId)}`;
  const res = await fetchWithAuth(url, accessToken);

  if (!res.ok) {
    const body = await res.text();
    let message = "Failed to fetch meeting";
    try {
      const json = JSON.parse(body) as { error?: { message?: string } };
      if (json?.error?.message) message = json.error.message;
    } catch {
      if (body) message = body.slice(0, 200);
    }
    throw new Error(message);
  }

  const raw = await res.json();
  const meeting = raw?.meeting ?? raw;
  const parsed = meetingDetailSchema.safeParse(meeting);
  if (!parsed.success) {
    throw new Error("Invalid meeting detail response");
  }
  return parsed.data as MeetingDetail;
}

export async function fetchTranscript(
  accessToken: string,
  meetingId: string,
  afterSeq?: number,
): Promise<TranscriptChunkDTO[]> {
  const params = new URLSearchParams();
  if (afterSeq != null) params.set("afterSeq", String(afterSeq));
  const qs = params.toString();
  const url = `${getBaseUrl()}/api/meetings/${encodeURIComponent(meetingId)}/transcript${qs ? `?${qs}` : ""}`;
  const res = await fetchWithAuth(url, accessToken);

  if (!res.ok) {
    const body = await res.text();
    let message = "Failed to fetch transcript";
    try {
      const json = JSON.parse(body) as { error?: { message?: string } };
      if (json?.error?.message) message = json.error.message;
    } catch {
      if (body) message = body.slice(0, 200);
    }
    throw new Error(message);
  }

  const raw = await res.json();
  const chunks = raw?.chunks ?? raw ?? [];
  if (!Array.isArray(chunks)) {
    return [];
  }
  return chunks
    .filter((c: unknown) => transcriptChunkSchema.safeParse(c).success)
    .map((c: unknown) => transcriptChunkSchema.parse(c)) as TranscriptChunkDTO[];
}

export async function fetchFullTranscript(
  accessToken: string,
  meetingId: string,
): Promise<TranscriptChunkDTO[]> {
  const all: TranscriptChunkDTO[] = [];
  let afterSeq: number | undefined;

  // Safety cap to avoid unbounded growth in extreme cases
  const MAX_CHUNKS = 10_000;

  // Keep fetching until no more chunks are returned or we hit the safety cap
  // listTranscript on the server side limits each page to 500 chunks
  // so this will walk through the transcript in batches.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const batch = await fetchTranscript(accessToken, meetingId, afterSeq);

    if (batch.length === 0) {
      break;
    }

    all.push(...batch);

    if (all.length >= MAX_CHUNKS) {
      break;
    }

    const last = batch[batch.length - 1];
    afterSeq = last?.seq;

    if (afterSeq == null) {
      break;
    }
  }

  return all;
}

export async function finalizeMeeting(
  accessToken: string,
  meetingId: string,
): Promise<void> {
  const url = `${getBaseUrl()}/api/meetings/${encodeURIComponent(meetingId)}/finalize`;
  const res = await fetchWithAuth(url, accessToken, { method: "POST" });

  if (!res.ok) {
    const body = await res.text();
    let message = "Failed to finalize meeting";
    try {
      const json = JSON.parse(body) as { error?: { message?: string } };
      if (json?.error?.message) message = json.error.message;
    } catch {
      if (body) message = body.slice(0, 200);
    }
    throw new Error(message);
  }
}

export async function deleteMeeting(
  accessToken: string,
  meetingId: string,
): Promise<void> {
  const url = `${getBaseUrl()}/api/meetings/${encodeURIComponent(meetingId)}`;
  const res = await fetchWithAuth(url, accessToken, { method: "DELETE" });

  if (!res.ok) {
    const body = await res.text();
    let message = "Failed to delete meeting";
    try {
      const json = JSON.parse(body) as { error?: { message?: string } };
      if (json?.error?.message) message = json.error.message;
    } catch {
      if (body) message = body.slice(0, 200);
    }
    throw new Error(message);
  }
}

