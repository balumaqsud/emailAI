import type { EmailClassificationType } from "@/src/server/models/emailClassification.model";

export type ClassificationPromptInput = {
  subject?: string | null;
  from?: string | null;
  bodyText: string;
};

export const CLASSIFICATION_TYPES: EmailClassificationType[] = [
  "invoice",
  "meeting",
  "support",
  "job_application",
  "general",
];

const PROMPT_VERSION = "v1";

export function getClassificationPromptVersion(): string {
  return PROMPT_VERSION;
}

export function buildClassificationPrompt(
  input: ClassificationPromptInput,
): string {
  const subject = input.subject?.trim() || "(no subject)";
  const from = input.from?.trim() || "(unknown sender)";
  const body = input.bodyText.trim();

  return [
    "You are an email classifier for an internal email client.",
    "",
    "Classify the following email into exactly one of these types:",
    CLASSIFICATION_TYPES.join(", "),
    "",
    "Return STRICT JSON with this shape and nothing else:",
    '{ "type": "<one of the types>", "confidence": <number between 0 and 1> }',
    "Do not include explanations, comments, or extra keys.",
    "",
    `Subject: ${subject}`,
    `From: ${from}`,
    "Body:",
    body,
  ].join("\n");
}

