import { z } from "zod";

const actionItemSchema = z.object({
  text: z.string(),
  owner: z.string().optional(),
  dueAt: z.string().optional(),
});

export const meetingListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  startAt: z.string(),
  endAt: z.string(),
  timezone: z.string(),
  status: z.string(),
  meetUrl: z.string().optional(),
  createdAt: z.string(),
});

export const meetingDetailSchema = meetingListItemSchema.extend({
  calendarEventId: z.string().optional(),
  attendeeEmails: z.array(z.string()),
  artifact: z
    .object({
      summary: z.string().optional(),
      actionItems: z.array(actionItemSchema),
      topics: z.array(z.string()),
      completedAt: z.string(),
    })
    .optional(),
  botState: z.string().optional(),
});

export const transcriptChunkSchema = z.object({
  id: z.string(),
  seq: z.number(),
  speakerName: z.string().optional(),
  text: z.string(),
  startMs: z.number().optional(),
  endMs: z.number().optional(),
  receivedAt: z.string(),
});

export const meetingsListDataSchema = z.object({
  items: z.array(meetingListItemSchema),
  nextCursor: z.string().optional(),
});
