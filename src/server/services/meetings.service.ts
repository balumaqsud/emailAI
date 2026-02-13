import mongoose from "mongoose";
import { dbConnect } from "@/src/server/db";
import {
  Meeting,
  RecallBot,
  TranscriptChunk,
  MeetingArtifact,
  User,
} from "@/src/server/models";
import { createBot } from "./recall.service";
import { summarizeMeeting } from "@/src/server/ai/services/summarizeMeeting.service";
import { setFinalizeMeetingFn } from "./webhook.service";
import { badRequest, notFound } from "@/src/server/utils/httpErrors";
import type { Types } from "mongoose";

export type ScheduleMeetingPayload = {
  title: string;
  meetUrl: string;
  startAt: string | Date;
  endAt: string | Date;
  timezone?: string;
  attendeeEmails?: string[];
};

export type MeetingListItem = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  timezone: string;
  status: string;
  meetUrl?: string;
  createdAt: string;
};

export type MeetingDetail = MeetingListItem & {
  calendarEventId?: string;
  attendeeEmails: string[];
  artifact?: {
    summary?: string;
    actionItems: Array<{ text: string; owner?: string; dueAt?: string }>;
    topics: string[];
    completedAt: string;
  };
  botState?: string;
};

export type TranscriptChunkDTO = {
  id: string;
  seq: number;
  speakerName?: string;
  text: string;
  startMs?: number;
  endMs?: number;
  receivedAt: string;
};

function toMeetingListItem(m: { _id: Types.ObjectId; title: string; startAt: Date; endAt: Date; timezone: string; status: string; meetUrl?: string; createdAt: Date }): MeetingListItem {
  return {
    id: m._id.toString(),
    title: m.title,
    startAt: m.startAt.toISOString(),
    endAt: m.endAt.toISOString(),
    timezone: m.timezone,
    status: m.status,
    meetUrl: m.meetUrl,
    createdAt: m.createdAt.toISOString(),
  };
}

async function ensureFinalizeFnSet(): Promise<void> {
  setFinalizeMeetingFn(finalizeMeeting);
}

export async function scheduleMeeting(
  userId: string,
  payload: ScheduleMeetingPayload,
): Promise<MeetingListItem> {
  await dbConnect();

  const user = await User.findById(userId);
  if (!user) throw notFound("User not found");

  const meetUrl = payload.meetUrl?.trim();
  if (!meetUrl || !meetUrl.startsWith("https://")) {
    throw badRequest(
      "A valid meeting URL is required (e.g. from Google Meet, Zoom, or Teams).",
    );
  }

  const startAt = new Date(payload.startAt);
  const endAt = new Date(payload.endAt);
  const timezone = payload.timezone ?? "UTC";
  const attendeeEmails = payload.attendeeEmails ?? [];

  if (isNaN(startAt.getTime()) || isNaN(endAt.getTime())) {
    throw badRequest("Invalid start or end date.");
  }
  if (endAt <= startAt) {
    throw badRequest("End time must be after start time.");
  }

  const meeting = await Meeting.create({
    ownerUserId: new mongoose.Types.ObjectId(userId),
    title: payload.title,
    startAt,
    endAt,
    timezone,
    attendeeEmails,
    meetUrl,
    status: "scheduled",
  });

  const recallResult = await createBot({
    meetingUrl: meetUrl,
    metadata: { meetingId: meeting._id.toString() },
  });

  await RecallBot.create({
    meetingId: meeting._id,
    recallBotId: recallResult.recallBotId,
    state: "scheduled",
  });

  return toMeetingListItem(meeting);
}

export async function listMeetings(
  userId: string,
  pagination?: { limit?: number; cursor?: string },
): Promise<{ items: MeetingListItem[]; nextCursor?: string }> {
  await dbConnect();

  const limit = Math.min(pagination?.limit ?? 50, 100);
  const query: { ownerUserId: Types.ObjectId; _id?: { $lt: Types.ObjectId } } = {
    ownerUserId: new mongoose.Types.ObjectId(userId),
  };
  if (pagination?.cursor) {
    try {
      query._id = { $lt: new mongoose.Types.ObjectId(pagination.cursor) };
    } catch {
      // invalid cursor, ignore
    }
  }

  const items = await Meeting.find(query)
    .sort({ startAt: -1 })
    .limit(limit + 1)
    .lean();

  const hasMore = items.length > limit;
  const slice = hasMore ? items.slice(0, limit) : items;
  const nextCursor = hasMore && slice.length > 0
    ? slice[slice.length - 1]!._id.toString()
    : undefined;

  return {
    items: slice.map((m) =>
      toMeetingListItem({
        _id: m._id,
        title: m.title,
        startAt: m.startAt,
        endAt: m.endAt,
        timezone: m.timezone,
        status: m.status,
        meetUrl: m.meetUrl,
        createdAt: m.createdAt,
      }),
    ),
    nextCursor,
  };
}

export async function getMeeting(
  userId: string,
  meetingId: string,
): Promise<MeetingDetail | null> {
  await dbConnect();

  const meeting = await Meeting.findOne({
    _id: new mongoose.Types.ObjectId(meetingId),
    ownerUserId: new mongoose.Types.ObjectId(userId),
  }).lean();

  if (!meeting) return null;

  const bot = await RecallBot.findOne({ meetingId: meeting._id })
    .sort({ createdAt: -1 })
    .lean();

  const artifact = await MeetingArtifact.findOne({
    meetingId: meeting._id,
  }).lean();

  const base = toMeetingListItem({
    _id: meeting._id,
    title: meeting.title,
    startAt: meeting.startAt,
    endAt: meeting.endAt,
    timezone: meeting.timezone,
    status: meeting.status,
    meetUrl: meeting.meetUrl,
    createdAt: meeting.createdAt,
  });

  return {
    ...base,
    calendarEventId: meeting.calendarEventId,
    attendeeEmails: meeting.attendeeEmails ?? [],
    artifact: artifact
      ? {
          summary: artifact.summary,
          actionItems: (artifact.actionItems ?? []).map((a) => ({
            text: a.text,
            owner: a.owner,
            dueAt: a.dueAt ? a.dueAt.toISOString() : undefined,
          })),
          topics: artifact.topics ?? [],
          completedAt: artifact.completedAt.toISOString(),
        }
      : undefined,
    botState: bot?.state,
  };
}

export async function listTranscript(
  userId: string,
  meetingId: string,
  afterSeq?: number,
): Promise<TranscriptChunkDTO[]> {
  await dbConnect();

  const meeting = await Meeting.findOne({
    _id: new mongoose.Types.ObjectId(meetingId),
    ownerUserId: new mongoose.Types.ObjectId(userId),
  });
  if (!meeting) return [];

  const query: { meetingId: Types.ObjectId; seq?: { $gt: number } } = {
    meetingId: meeting._id,
  };
  if (afterSeq != null) {
    query.seq = { $gt: afterSeq };
  }

  const chunks = await TranscriptChunk.find(query)
    .sort({ seq: 1 })
    .limit(500)
    .lean();

  return chunks.map((c) => ({
    id: c._id.toString(),
    seq: c.seq,
    speakerName: c.speakerName,
    text: c.text,
    startMs: c.startMs,
    endMs: c.endMs,
    receivedAt: c.receivedAt.toISOString(),
  }));
}

export async function finalizeMeeting(meetingId: string): Promise<void> {
  await dbConnect();
  await ensureFinalizeFnSet();

  const meeting = await Meeting.findById(meetingId);
  if (!meeting) return;

  const chunks = await TranscriptChunk.find({ meetingId: meeting._id })
    .sort({ seq: 1 })
    .lean();

  const finalTranscript = chunks.map((c) => c.text).join("\n\n").trim();

  let summary = "";
  let actionItems: Array<{ text: string; owner?: string; dueAt?: string }> = [];
  let topics: string[] = [];

  if (finalTranscript) {
    const summarized = await summarizeMeeting(finalTranscript);
    summary = summarized.summary;
    actionItems = summarized.actionItems;
    topics = summarized.topics;
  }

  await MeetingArtifact.findOneAndUpdate(
    { meetingId: meeting._id },
    {
      finalTranscript,
      summary,
      actionItems: actionItems.map((a) => ({
        text: a.text,
        owner: a.owner,
        dueAt: a.dueAt ? new Date(a.dueAt) : undefined,
      })),
      topics,
      completedAt: new Date(),
    },
    { upsert: true, new: true },
  );

  meeting.status = "completed";
  await meeting.save();
}

export async function deleteMeeting(
  userId: string,
  meetingId: string,
): Promise<void> {
  await dbConnect();

  const meeting = await Meeting.findOne({
    _id: new mongoose.Types.ObjectId(meetingId),
    ownerUserId: new mongoose.Types.ObjectId(userId),
  });
  if (!meeting) {
    throw notFound("Meeting not found.");
  }

  const meetingObjId = meeting._id;
  await TranscriptChunk.deleteMany({ meetingId: meetingObjId });
  await MeetingArtifact.deleteMany({ meetingId: meetingObjId });
  await RecallBot.deleteMany({ meetingId: meetingObjId });
  await Meeting.deleteOne({ _id: meetingObjId });
}
