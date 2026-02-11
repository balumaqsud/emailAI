import { z } from "zod";
import { getOpenAIClient } from "@/src/server/ai";
import {
  GeneralExtractionSchema,
  GENERAL_PROMPT_VERSION,
  GENERAL_SCHEMA_VERSION,
  type GeneralExtraction,
} from "@/src/server/ai/schemas/general.schema";

type ExtractGeneralInput = {
  subject?: string | null;
  from?: string | null;
  bodyText: string;
};

export type ExtractGeneralResult = {
  data: GeneralExtraction;
  missingFields: string[];
  confidence: number;
  model: string;
  promptVersion: string;
  schemaVersion: string;
};

const GeneralResultEnvelopeSchema = z
  .object({
    summary: z.string().optional(),
    keyEntities: z.array(z.string()).optional(),
    dates: z.array(z.string()).optional(),
  })
  .strict();

function getModelName(): string {
  return process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
}

function buildPrompt(input: ExtractGeneralInput): string {
  const subject = input.subject?.trim() || "(no subject)";
  const from = input.from?.trim() || "(unknown sender)";
  const body = input.bodyText.trim();

  return [
    "You are an AI that extracts structured information from emails.",
    "",
    "Return STRICT JSON only, matching exactly this TypeScript type (no extra keys):",
    "",
    "type GeneralExtraction = {",
    "  summary?: string;        // short human-readable summary of the email",
    "  keyEntities?: string[];  // important names, companies, or systems mentioned",
    "  dates?: string[];        // plain-text dates mentioned (as seen in the email)",
    "};",
    "",
    "Rules:",
    "- Never invent or hallucinate entities or dates that are not clearly present.",
    "- If you are unsure, leave the corresponding field empty or omit it.",
    "- Do not include comments or explanations in the JSON.",
    "",
    `Subject: ${subject}`,
    `From: ${from}`,
    "Body:",
    body,
  ].join("\n");
}

function computeMissingFields(data: GeneralExtraction): string[] {
  const missing: string[] = [];

  if (!data.summary || data.summary.trim().length === 0) {
    missing.push("summary");
  }
  if (!data.keyEntities || data.keyEntities.length === 0) {
    missing.push("keyEntities");
  }
  if (!data.dates || data.dates.length === 0) {
    missing.push("dates");
  }

  return missing;
}

function computeConfidence(missingFields: string[]): number {
  const totalFields = 3;
  const missingCount = missingFields.length;
  const filledCount = Math.max(0, totalFields - missingCount);
  const base = filledCount / totalFields;
  return Math.min(1, Math.max(0, base));
}

export async function extractGeneral(
  input: ExtractGeneralInput,
): Promise<ExtractGeneralResult> {
  const client = getOpenAIClient();
  const model = getModelName();
  const prompt = buildPrompt(input);

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content:
          "You are a strict JSON-only email extraction engine. You must obey the schema exactly.",
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
    // eslint-disable-next-line no-console
    console.error("Failed to parse general extraction JSON:", text, error);
    throw new Error("Failed to parse general extraction response.");
  }

  const envelope = GeneralResultEnvelopeSchema.safeParse(parsed);
  if (!envelope.success) {
    // eslint-disable-next-line no-console
    console.error("Invalid general extraction schema:", envelope.error);
    throw new Error("Invalid general extraction response schema.");
  }

  const data = GeneralExtractionSchema.parse(envelope.data);
  const missingFields = computeMissingFields(data);
  const confidence = computeConfidence(missingFields);

  return {
    data,
    missingFields,
    confidence,
    model,
    promptVersion: GENERAL_PROMPT_VERSION,
    schemaVersion: GENERAL_SCHEMA_VERSION,
  };
}
