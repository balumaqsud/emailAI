import { z } from "zod";
import { getOpenAIClient } from "@/src/server/ai";
import {
  InvoiceExtractionSchema,
  CRM_INVOICE_PROMPT_VERSION,
  CRM_INVOICE_SCHEMA_VERSION,
  type InvoiceExtraction,
} from "@/src/server/ai/schemas/crm.schema";

type ExtractInvoiceInput = {
  subject?: string | null;
  from?: string | null;
  bodyText: string;
};

export type ExtractInvoiceResult = {
  data: InvoiceExtraction;
  missingFields: string[];
  confidence: number;
  model: string;
  promptVersion: string;
  schemaVersion: string;
};

const InvoiceEnvelopeSchema = z
  .object({
    intent: z.string(),
  })
  .passthrough();

function getModelName(): string {
  return process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
}

function buildPrompt(input: ExtractInvoiceInput): string {
  const subject = input.subject?.trim() || "(no subject)";
  const from = input.from?.trim() || "(unknown sender)";
  const body = input.bodyText.trim();

  return [
    "You are an AI that extracts structured invoice information from emails.",
    "",
    "Return STRICT JSON only, matching exactly this TypeScript type (no extra keys):",
    "",
    "type InvoiceExtraction = {",
    '  intent: "create_invoice";',
    "  company?: string; // e.g. vendor or billing company name",
    "  invoice?: {",
    "    invoice_number?: string; // e.g. \"INV-2026-114\"",
    "    amount?: number;         // numeric amount (e.g. 1250)",
    "    currency?: string;       // e.g. \"USD\"",
    "    due_date?: string;       // e.g. ISO date or natural language date",
    "  };",
    "};",
    "",
    "Rules:",
    "- Do not invent invoice numbers or amounts.",
    "- Parse numeric amounts as plain numbers (e.g. 1250 for $1,250).",
    "- Do not include comments or explanations in the JSON.",
    "",
    `Subject: ${subject}`,
    `From: ${from}`,
    "Body:",
    body,
  ].join("\n");
}

function computeMissingFields(data: InvoiceExtraction): string[] {
  const missing: string[] = [];
  if (!data.invoice?.invoice_number) missing.push("invoice.invoice_number");
  if (data.invoice?.amount == null) missing.push("invoice.amount");
  if (!data.invoice?.due_date) missing.push("invoice.due_date");
  return missing;
}

function computeConfidence(missingFields: string[]): number {
  const totalFields = 3;
  const missingCount = missingFields.length;
  const filledCount = Math.max(0, totalFields - missingCount);
  const base = filledCount / totalFields;
  return Math.min(1, Math.max(0, base));
}

export async function extractInvoice(
  input: ExtractInvoiceInput,
): Promise<ExtractInvoiceResult> {
  const client = getOpenAIClient();
  const model = getModelName();
  const prompt = buildPrompt(input);

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content:
          "You are a strict JSON-only invoice extraction engine. You must obey the schema exactly.",
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
    throw new Error("Failed to parse invoice extraction response as JSON.");
  }

  const envelope = InvoiceEnvelopeSchema.safeParse(parsed);
  if (!envelope.success) {
    throw new Error("Invalid invoice extraction envelope.");
  }

  const result = InvoiceExtractionSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error("Invalid invoice extraction schema.");
  }

  const data = result.data;
  const missingFields = computeMissingFields(data);
  const confidence = computeConfidence(missingFields);

  return {
    data,
    missingFields,
    confidence,
    model,
    promptVersion: CRM_INVOICE_PROMPT_VERSION,
    schemaVersion: CRM_INVOICE_SCHEMA_VERSION,
  };
}

