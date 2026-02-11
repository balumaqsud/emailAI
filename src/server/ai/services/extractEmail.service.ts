import { Types } from "mongoose";
import { dbConnect } from "@/src/server/db";
import {
  EmailExtraction,
  type EmailExtractionType,
  type IEmailExtraction,
} from "@/src/server/models/emailExtraction.model";
import { extractGeneral } from "./extractGeneral.service";
import { extractCrmSupport } from "./extractCrmSupport.service";
import { extractInvoice } from "./extractInvoice.service";
import { extractMeeting } from "./extractMeeting.service";

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
  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/82fb972f-c31b-4021-b252-62d4c5e26664", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "extractEmail.service.ts:entry",
      message: "extractEmail called",
      data: {
        userId: String(params.userId),
        messageId: String(params.messageId),
        type: params.type,
      },
      timestamp: Date.now(),
      hypothesisId: "H2_H3",
    }),
  }).catch(() => {});
  // #endregion
  await dbConnect();

  const userObjectId =
    typeof params.userId === "string"
      ? new Types.ObjectId(params.userId)
      : params.userId;
  const messageObjectId =
    typeof params.messageId === "string"
      ? new Types.ObjectId(params.messageId)
      : params.messageId;

  let status: "done" | "failed" = "done";
  let extractedData: Record<string, unknown> | null = null;
  let confidence = 0;
  let missingFields: string[] = [];
  let warnings: string[] = [];
  let model = "";
  let promptVersion = "";
  let schemaVersion = "";

  try {
    if (params.type === "invoice") {
      const result = await extractInvoice({
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
    } else if (params.type === "meeting") {
      const result = await extractMeeting({
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
    } else if (params.type === "support") {
      const result = await extractCrmSupport({
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
    } else {
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
    }
  } catch (error) {
    status = "failed";
    extractedData = null;
    confidence = 0;
    missingFields = ["summary", "keyEntities", "dates"];
    warnings = ["Extraction failed"];
    // eslint-disable-next-line no-console
    console.error("Error during email extraction:", error);
  }

  let doc: IEmailExtraction | null = null;
  try {
    doc = await EmailExtraction.findOneAndUpdate(
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
  } catch (updateErr) {
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/82fb972f-c31b-4021-b252-62d4c5e26664", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "extractEmail.service.ts:findOneAndUpdate catch",
        message: "findOneAndUpdate threw",
        data: {
          userId: String(params.userId),
          messageId: String(params.messageId),
          errorMsg: updateErr instanceof Error ? updateErr.message : String(updateErr),
        },
        timestamp: Date.now(),
        hypothesisId: "H3_H4",
      }),
    }).catch(() => {});
    // #endregion
    throw updateErr;
  }

  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/82fb972f-c31b-4021-b252-62d4c5e26664", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "extractEmail.service.ts:after findOneAndUpdate",
      message: "extractEmail write done",
      data: {
        userId: String(params.userId),
        messageId: String(params.messageId),
        docId: doc?._id?.toString() ?? null,
      },
      timestamp: Date.now(),
      hypothesisId: "H3",
    }),
  }).catch(() => {});
  // #endregion

  return doc as IEmailExtraction;
}

