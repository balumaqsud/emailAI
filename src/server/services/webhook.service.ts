import mongoose from "mongoose";
import { dbConnect } from "@/src/server/db";
import {
  Meeting,
  RecallBot,
  TranscriptChunk,
} from "@/src/server/models";

type RecallWebhookPayload = {
  event: string;
  data?: {
    data?: {
      code?: string;
      sub_code?: string | null;
      words?: Array<{
        text?: string;
        start_timestamp?: { relative?: number };
        end_timestamp?: { relative?: number } | null;
      }>;
      participant?: {
        id?: number;
        name?: string | null;
        is_host?: boolean;
        platform?: string | null;
        email?: string | null;
      };
    };
    bot?: {
      id?: string;
      metadata?: Record<string, string>;
    };
  };
};

const STATUS_EVENT_TO_BOT_STATE: Record<string, "joining" | "in_call" | "done" | "failed"> = {
  "bot.joining_call": "joining",
  "bot.in_waiting_room": "joining",
  "bot.in_call_not_recording": "in_call",
  "bot.recording_permission_allowed": "in_call",
  "bot.in_call_recording": "in_call",
  "bot.call_ended": "in_call",
  "bot.done": "done",
  "bot.fatal": "failed",
};

const STATUS_EVENT_TO_MEETING_STATUS: Record<string, "in_progress" | "completed" | "failed"> = {
  "bot.in_call_recording": "in_progress",
  "bot.in_call_not_recording": "in_progress",
  "bot.recording_permission_allowed": "in_progress",
  "bot.call_ended": "in_progress",
  "bot.done": "completed",
  "bot.fatal": "failed",
};

let finalizeMeetingFn: ((meetingId: string) => Promise<void>) | null = null;

export function setFinalizeMeetingFn(
  fn: (meetingId: string) => Promise<void>,
): void {
  finalizeMeetingFn = fn;
}

export async function handleRecallWebhook(payload: RecallWebhookPayload): Promise<void> {
  const event = payload.event;
  const data = payload.data;

  if (!data?.bot?.metadata?.meetingId) {
    if (process.env.APP_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log("[Recall webhook] No meetingId in metadata, skipping", event);
    }
    return;
  }

  const meetingId = data.bot.metadata.meetingId;
  const recallBotId = data.bot.id ?? "";

  await dbConnect();

  if (event === "transcript.data") {
    const words = data.data?.words ?? [];
    const participant = data.data?.participant;
    const text = words.map((w) => w?.text ?? "").join(" ").trim();
    if (!text) return;

    const startRel = words[0]?.start_timestamp?.relative;
    const endRel = words[words.length - 1]?.end_timestamp?.relative ?? words[words.length - 1]?.start_timestamp?.relative;
    const startMs = startRel != null ? Math.round(startRel * 1000) : undefined;
    const endMs = endRel != null ? Math.round(endRel * 1000) : undefined;

    const ts = Date.now();
    const meetingObjId = new mongoose.Types.ObjectId(meetingId);
    const seq = await TranscriptChunk.countDocuments({ meetingId: meetingObjId });
    const chunkKey = `${meetingId}_${recallBotId}_${ts}_${seq}`;

    try {
      await TranscriptChunk.create({
        meetingId: meetingObjId,
        recallBotId,
        seq,
        chunkKey,
        speakerName: participant?.name ?? undefined,
        speakerId: participant?.id != null ? String(participant.id) : undefined,
        text,
        startMs,
        endMs,
        receivedAt: new Date(),
      });
    } catch (err) {
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        (err as { code?: number }).code === 11000
      ) {
        return;
      }
      throw err;
    }
    return;
  }

  const botState = STATUS_EVENT_TO_BOT_STATE[event];
  const meetingStatus = STATUS_EVENT_TO_MEETING_STATUS[event];

  if (botState || meetingStatus) {
    await RecallBot.findOneAndUpdate(
      { recallBotId },
      { state: botState ?? undefined },
      { new: true },
    );

    if (meetingStatus) {
      await Meeting.findByIdAndUpdate(meetingId, {
        status: meetingStatus,
      });
    }

    if (event === "bot.done" && finalizeMeetingFn) {
      void finalizeMeetingFn(meetingId).catch((err) => {
        // eslint-disable-next-line no-console
        console.error("[Recall webhook] finalizeMeeting failed:", err);
      });
    }
  }
}
