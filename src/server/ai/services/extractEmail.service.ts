import { Types } from "mongoose";
import { dbConnect } from "@/src/server/db";
import {
  EmailExtraction,
  type EmailExtractionType,
  type IEmailExtraction,
} from "@/src/server/models/emailExtraction.model";
import { extractGeneral } from "./extractGeneral.service";

export type ExtractEmailParams = {
  userId: string | Types.ObjectId;
  messageId: string | Types.ObjectId;
  type: EmailExtractionType;
  subject?: string | null;
  from?: string | null;
  bodyText: string;
};

export async function extractEmail(
  params: ExtractEmailParams,
): Promise<IEmailExtraction> {
  await dbConnect();

  const userObjectId =
    typeof params.userId === "string"
      ? new Types.ObjectId(params.userId)
      : params.userId;
  const messageObjectId =
    typeof params.messageId === "string"
      ? new Types.ObjectId(params.messageId)
      : params.messageId;

  if (params.type !== "general") {
    throw new Error(
      `No extractor implemented for email type: ${params.type}`,
    );
  }

  let status: "done" | "failed" = "done";
  let extractedData: Record<string, unknown> | null = null;
  let confidence = 0;
  let missingFields: string[] = [];
  let warnings: string[] = [];
  let model = "";
  let promptVersion = "";
  let schemaVersion = "";

  try {
    const result = await extractGeneral({
      subject: params.subject,
      from: params.from,
      bodyText: params.bodyText,
    });

    extractedData = result.data as Record<string, unknown>;
    missingFields = result.missingFields;
    confidence = result.confidence;
    model = result.model;
    promptVersion = result.promptVersion;
    schemaVersion = result.schemaVersion;
  } catch (error) {
    status = "failed";
    extractedData = null;
    confidence = 0;
    missingFields = ["summary", "keyEntities", "dates"];
    warnings = ["General extraction failed"];
    // eslint-disable-next-line no-console
    console.error("Error during general email extraction:", error);
  }

  const doc = await EmailExtraction.findOneAndUpdate(
    {
      userId: userObjectId,
      messageId: messageObjectId,
      type: params.type,
      schemaVersion: schemaVersion || "general_v1",
    },
    {
      $set: {
        status,
        extractedData,
        confidence,
        missingFields,
        warnings,
        modelName: model || process.env.OPENAI_MODEL || "gpt-4.1-mini",
        promptVersion: promptVersion || "general_v1",
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

