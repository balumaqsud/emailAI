import { Types } from "mongoose";
import { z } from "zod";
import { dbConnect } from "@/src/server/db";
import {
  EmailClassification,
  type EmailClassificationType,
  type IEmailClassification,
} from "@/src/server/models/emailClassification.model";
import { getOpenAIClient } from "@/src/server/ai";
import {
  buildClassificationPrompt,
  CLASSIFICATION_TYPES,
  getClassificationPromptVersion,
  type ClassificationPromptInput,
} from "@/src/server/ai/prompts/classify.prompt";

const ClassificationResultSchema = z
  .object({
    type: z.enum(CLASSIFICATION_TYPES as [string, ...string[]]),
    confidence: z.number().min(0).max(1),
  })
  .strict();

export type ClassificationResult = z.infer<typeof ClassificationResultSchema>;

export type ClassifyEmailParams = {
  userId: string | Types.ObjectId;
  messageId: string | Types.ObjectId;
  subject?: string | null;
  from?: string | null;
  bodyText: string;
};

function getModelName(): string {
  return process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
}

async function callOpenAIForClassification(
  input: ClassificationPromptInput,
): Promise<ClassificationResult> {
  const client = getOpenAIClient();
  const model = getModelName();
  const prompt = buildClassificationPrompt(input);

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: "You are a strict JSON-only email classification engine.",
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

  const text =
    typeof content === "string"
      ? content
      : Array.isArray(content)
        ? (content as Array<{ text?: string }>).map((part) => part?.text ?? "").join(" ").trim()
        : "";

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to parse classification JSON:", text, error);
    throw new Error("Failed to parse classification response.");
  }

  const result = ClassificationResultSchema.safeParse(parsed);
  if (!result.success) {
    // eslint-disable-next-line no-console
    console.error("Invalid classification schema:", result.error);
    throw new Error("Invalid classification response schema.");
  }

  return result.data;
}

export async function classifyEmail(
  params: ClassifyEmailParams,
): Promise<IEmailClassification> {
  await dbConnect();

  const userObjectId =
    typeof params.userId === "string"
      ? new Types.ObjectId(params.userId)
      : params.userId;
  const messageObjectId =
    typeof params.messageId === "string"
      ? new Types.ObjectId(params.messageId)
      : params.messageId;

  let result: ClassificationResult;
  try {
    result = await callOpenAIForClassification({
      subject: params.subject,
      from: params.from,
      bodyText: params.bodyText,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error during email classification:", error);
    throw new Error("Failed to classify email.");
  }

  const promptVersion = getClassificationPromptVersion();

  const doc = await EmailClassification.findOneAndUpdate(
    {
      userId: userObjectId,
      messageId: messageObjectId,
    },
    {
      $set: {
        type: result.type as EmailClassificationType,
        confidence: result.confidence,
        modelName: getModelName(),
        promptVersion,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  ).exec();

  return doc;
}

