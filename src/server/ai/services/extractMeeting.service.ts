import { z } from "zod";
import { getOpenAIClient } from "@/src/server/ai";
import {
  MeetingExtractionSchema,
  CRM_MEETING_PROMPT_VERSION,
  CRM_MEETING_SCHEMA_VERSION,
  type MeetingExtraction,
} from "@/src/server/ai/schemas/crm.schema";

type ExtractMeetingInput = {
  subject?: string | null;
  from?: string | null;
  bodyText: string;
};

export type ExtractMeetingResult = {
  data: MeetingExtraction;
  missingFields: string[];
  confidence: number;
  model: string;
  promptVersion: string;
  schemaVersion: string;
};

const MeetingEnvelopeSchema = z
  .object({
    intent: z.string(),
  })
  .passthrough();

function getModelName(): string {
  return process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
}

function buildPrompt(input: ExtractMeetingInput): string {
  const subject = input.subject?.trim() || "(no subject)";
  const from = input.from?.trim() || "(unknown sender)";
  const body = input.bodyText.trim();

  return [
    "You are an AI that extracts structured meeting scheduling information from emails.",
    "",
    "Return STRICT JSON only, matching exactly this TypeScript type (no extra keys):",
    "",
    "type MeetingExtraction = {",
    '  intent: "schedule_meeting";',
    "  contact?: { name?: string; email?: string };",
    "  meeting?: {",
    "    proposed_time?: string; // e.g. \"Next Tuesday 3 PM\"",
    "    topic?: string;         // e.g. \"New onboarding flow discussion\"",
    "  };",
    "};",
    "",
    "Rules:",
    "- Do not invent dates or topics that are not clearly present.",
    "- Do not include comments or explanations in the JSON.",
    "",
    `Subject: ${subject}`,
    `From: ${from}`,
    "Body:",
    body,
  ].join("\n");
}

function computeMissingFields(data: MeetingExtraction): string[] {
  const missing: string[] = [];
  if (!data.meeting?.proposed_time) missing.push("meeting.proposed_time");
  if (!data.meeting?.topic) missing.push("meeting.topic");
  return missing;
}

function computeConfidence(missingFields: string[]): number {
  const totalFields = 2;
  const missingCount = missingFields.length;
  const filledCount = Math.max(0, totalFields - missingCount);
  const base = filledCount / totalFields;
  return Math.min(1, Math.max(0, base));
}

export async function extractMeeting(
  input: ExtractMeetingInput,
): Promise<ExtractMeetingResult> {
  const client = getOpenAIClient();
  const model = getModelName();
  const prompt = buildPrompt(input);

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content:
          "You are a strict JSON-only meeting extraction engine. You must obey the schema exactly.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0,
  });

  const choice = response.choices[0];
  const content = choice.message?.content;

  type ContentPart = { text?: string };
  const text =
    typeof content === "string"
      ? content
      : Array.isArray(content)
        ? (content as ContentPart[])
            .map((part) => part?.text ?? "")
            .join(" ")
            .trim()
        : "";

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new Error("Failed to parse meeting extraction response as JSON.");
  }

  const envelope = MeetingEnvelopeSchema.safeParse(parsed);
  if (!envelope.success) {
    throw new Error("Invalid meeting extraction envelope.");
  }

  const result = MeetingExtractionSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error("Invalid meeting extraction schema.");
  }

  const data = result.data;
  const missingFields = computeMissingFields(data);
  const confidence = computeConfidence(missingFields);

  return {
    data,
    missingFields,
    confidence,
    model,
    promptVersion: CRM_MEETING_PROMPT_VERSION,
    schemaVersion: CRM_MEETING_SCHEMA_VERSION,
  };
}

