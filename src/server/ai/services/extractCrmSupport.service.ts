import { z } from "zod";
import { getOpenAIClient } from "@/src/server/ai";
import {
  CrmSupportOrDealSchema,
  CRM_SUPPORT_PROMPT_VERSION,
  CRM_SUPPORT_SCHEMA_VERSION,
  type CrmSupportOrDealExtraction,
} from "@/src/server/ai/schemas/crm.schema";

type ExtractCrmSupportInput = {
  subject?: string | null;
  from?: string | null;
  bodyText: string;
};

export type ExtractCrmSupportResult = {
  data: CrmSupportOrDealExtraction;
  missingFields: string[];
  confidence: number;
  model: string;
  promptVersion: string;
  schemaVersion: string;
};

const CrmSupportResultEnvelopeSchema = z
  .object({
    intent: z.string(),
  })
  .passthrough();

function getModelName(): string {
  return process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
}

function buildPrompt(input: ExtractCrmSupportInput): string {
  const subject = input.subject?.trim() || "(no subject)";
  const from = input.from?.trim() || "(unknown sender)";
  const body = input.bodyText.trim();

  return [
    "You are an AI that extracts structured CRM data from support or sales emails.",
    "",
    "Return STRICT JSON only, matching EXACTLY ONE of these TypeScript types (no extra keys):",
    "",
    "type SupportTicketExtraction = {",
    '  intent: "create_ticket";',
    "  contact?: { name?: string; email?: string };",
    "  company?: string;",
    "  ticket?: {",
    "    issue?: string;",
    '    priority?: "low" | "medium" | "high" | "urgent";',
    "    urgency_reason?: string;",
    "  };",
    "};",
    "",
    "type DealExtraction = {",
    '  intent: "create_deal" | "create_lead";',
    "  contact?: { name?: string; email?: string };",
    "  company?: string;",
    "  deal?: {",
    "    product?: string;",
    "    users_requested?: number;",
    "    stage?: string;",
    "  };",
    "  task?: {",
    "    action?: string;",
    "  };",
    "};",
    "",
    "Rules:",
    "- Choose the shape that best matches the email.",
    "- Do not mix fields from both shapes.",
    "- Do not include comments or explanations in the JSON.",
    "",
    `Subject: ${subject}`,
    `From: ${from}`,
    "Body:",
    body,
  ].join("\n");
}

function computeMissingFields(data: CrmSupportOrDealExtraction): string[] {
  const missing: string[] = [];
  if (!data.contact?.email) missing.push("contact.email");
  if (!data.intent) missing.push("intent");
  return missing;
}

function computeConfidence(missingFields: string[]): number {
  const totalFields = 2;
  const missingCount = missingFields.length;
  const filledCount = Math.max(0, totalFields - missingCount);
  const base = filledCount / totalFields;
  return Math.min(1, Math.max(0, base));
}

export async function extractCrmSupport(
  input: ExtractCrmSupportInput,
): Promise<ExtractCrmSupportResult> {
  const client = getOpenAIClient();
  const model = getModelName();
  const prompt = buildPrompt(input);

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content:
          "You are a strict JSON-only CRM extraction engine. You must obey the schema exactly.",
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
    throw new Error("Failed to parse CRM support extraction response as JSON.");
  }

  const envelope = CrmSupportResultEnvelopeSchema.safeParse(parsed);
  if (!envelope.success) {
    throw new Error("Invalid CRM support extraction envelope.");
  }

  const result = CrmSupportOrDealSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error("Invalid CRM support/deal extraction schema.");
  }

  const data = result.data;
  const missingFields = computeMissingFields(data);
  const confidence = computeConfidence(missingFields);

  return {
    data,
    missingFields,
    confidence,
    model,
    promptVersion: CRM_SUPPORT_PROMPT_VERSION,
    schemaVersion: CRM_SUPPORT_SCHEMA_VERSION,
  };
}

